<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\LoginRequest;
use App\Http\Requests\Api\RegisterRequest;
use App\Http\Requests\Api\UpdateProfileRequest;
use App\Http\Resources\Api\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use App\Notifications\PasswordResetOtpNotification;
use App\Notifications\WelcomeNotification;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create([
            'name'  => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'password' => $request->password,
        ]);

        $user->assignRole('customer');
        $user->notify(new WelcomeNotification());

        $token = $user->createToken('mobile')->plainTextToken;

        return response()->json([
            'message' => 'Registration successful',
            'token'   => $token,
            'user'    => new UserResource($user),
        ], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        if (!$user->is_active) {
            return response()->json(['message' => 'Account deactivated. Contact support.'], 403);
        }

        $user->tokens()->where('name', 'mobile')->delete();
        $token = $user->createToken('mobile')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'token'   => $token,
            'user'    => new UserResource($user),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully']);
    }

    public function profile(Request $request): JsonResponse
    {
        return response()->json(['user' => new UserResource($request->user()->load('defaultAddress'))]);
    }

    public function updateProfile(UpdateProfileRequest $request): JsonResponse
    {
        $user = $request->user();
        $data = $request->only(['name', 'phone', 'gender', 'date_of_birth']);

        if ($request->hasFile('avatar')) {
            if ($user->avatar) {
                Storage::disk('public')->delete($user->avatar);
            }
            $data['avatar'] = $request->file('avatar')->store('avatars', 'public');
        }

        $user->update($data);

        return response()->json([
            'message' => 'Profile updated',
            'user'    => new UserResource($user->fresh()),
        ]);
    }

    public function changePassword(Request $request): JsonResponse
    {
        $request->validate([
            'current_password' => 'required',
            'password'         => 'required|min:8|confirmed',
        ]);

        if (!Hash::check($request->current_password, $request->user()->password)) {
            throw ValidationException::withMessages(['current_password' => ['Incorrect current password.']]);
        }

        $request->user()->update(['password' => $request->password]);

        return response()->json(['message' => 'Password changed successfully']);
    }

    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate(['email' => 'required|email|exists:users,email']);

        $user = User::where('email', $request->email)->first();
        $otp  = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        $user->update([
            'otp'            => Hash::make($otp),
            'otp_expires_at' => now()->addMinutes(15),
        ]);

        $user->notify(new PasswordResetOtpNotification($otp));

        return response()->json(['message' => 'OTP sent to your email address']);
    }

    public function resetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'email'    => 'required|email|exists:users,email',
            'otp'      => 'required',
            'password' => 'required|min:8|confirmed',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user->otp || !Hash::check($request->otp, $user->otp)) {
            return response()->json(['message' => 'Invalid OTP'], 422);
        }

        if (!$user->otp_expires_at || $user->otp_expires_at->isPast()) {
            return response()->json(['message' => 'OTP has expired'], 422);
        }

        $user->update([
            'password'       => $request->password,
            'otp'            => null,
            'otp_expires_at' => null,
        ]);

        return response()->json(['message' => 'Password reset successful']);
    }
}
