<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    private function paystackSecretKey(): string
    {
        return Setting::get('paystack_secret_key', config('services.paystack.secret'));
    }

    public function initialize(Request $request): JsonResponse
    {
        $request->validate(['order_number' => 'required|string']);

        $order = $request->user()->orders()
            ->where('order_number', $request->order_number)
            ->where('payment_status', 'unpaid')
            ->firstOrFail();

        $reference = 'SP_' . strtoupper(uniqid());

        Payment::create([
            'order_id'   => $order->id,
            'user_id'    => $request->user()->id,
            'reference'  => $reference,
            'amount'     => $order->total,
            'currency'   => 'NGN',
            'status'     => 'pending',
            'ip_address' => $request->ip(),
        ]);

        $response = Http::withToken($this->paystackSecretKey())
            ->post('https://api.paystack.co/transaction/initialize', [
                'email'     => $request->user()->email,
                'amount'    => (int) ($order->total * 100),
                'reference' => $reference,
                'metadata'  => [
                    'order_number' => $order->order_number,
                    'user_id'      => $request->user()->id,
                ],
            ]);

        if (!$response->successful()) {
            return response()->json(['message' => 'Payment initialization failed'], 500);
        }

        $data = $response->json('data');

        return response()->json([
            'reference'    => $reference,
            'access_code'  => $data['access_code'],
            'authorization_url' => $data['authorization_url'],
            'amount'       => $order->total,
        ]);
    }

    public function verify(Request $request): JsonResponse
    {
        $request->validate(['reference' => 'required|string']);

        $payment = Payment::where('reference', $request->reference)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        if ($payment->status === 'success') {
            return response()->json(['message' => 'Payment already verified', 'status' => 'success']);
        }

        $response = Http::withToken($this->paystackSecretKey())
            ->get("https://api.paystack.co/transaction/verify/{$request->reference}");

        if (!$response->successful()) {
            return response()->json(['message' => 'Verification failed'], 500);
        }

        $data   = $response->json('data');
        $status = $data['status'];

        $payment->update([
            'status'           => $status === 'success' ? 'success' : 'failed',
            'gateway_response' => $data,
            'channel'          => $data['channel'] ?? null,
            'paid_at'          => $status === 'success' ? now() : null,
        ]);

        if ($status === 'success') {
            $payment->order->update([
                'payment_status' => 'paid',
                'status'         => 'confirmed',
                'confirmed_at'   => now(),
            ]);
        }

        return response()->json([
            'status'  => $payment->status,
            'message' => $status === 'success' ? 'Payment successful' : 'Payment failed',
        ]);
    }

    public function webhook(Request $request): JsonResponse
    {
        $signature = $request->header('X-Paystack-Signature');
        $payload   = $request->getContent();
        $secret    = $this->paystackSecretKey();

        if (!$signature || !hash_equals(hash_hmac('sha512', $payload, $secret), $signature)) {
            Log::warning('Invalid Paystack webhook signature');
            return response()->json(['message' => 'Invalid signature'], 401);
        }

        $event = $request->input('event');
        $data  = $request->input('data');

        if ($event === 'charge.success') {
            $payment = Payment::where('reference', $data['reference'])->first();
            if ($payment && $payment->status !== 'success') {
                $payment->update([
                    'status'           => 'success',
                    'gateway_response' => $data,
                    'channel'          => $data['channel'] ?? null,
                    'paid_at'          => now(),
                ]);
                $payment->order->update([
                    'payment_status' => 'paid',
                    'status'         => 'confirmed',
                    'confirmed_at'   => now(),
                ]);
            }
        }

        return response()->json(['status' => 'ok']);
    }
}
