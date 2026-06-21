<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreAddressRequest;
use App\Http\Resources\Api\AddressResource;
use App\Models\Address;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AddressController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $addresses = $request->user()->addresses()->orderByDesc('is_default')->get();
        return response()->json(['data' => AddressResource::collection($addresses)]);
    }

    public function store(StoreAddressRequest $request): JsonResponse
    {
        if ($request->is_default) {
            $request->user()->addresses()->update(['is_default' => false]);
        }
        if ($request->user()->addresses()->count() === 0) {
            $request->merge(['is_default' => true]);
        }
        $address = $request->user()->addresses()->create($request->validated());
        return response()->json(['message' => 'Address added', 'data' => new AddressResource($address)], 201);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $address = $request->user()->addresses()->findOrFail($id);
        return response()->json(['data' => new AddressResource($address)]);
    }

    public function update(StoreAddressRequest $request, int $id): JsonResponse
    {
        $address = $request->user()->addresses()->findOrFail($id);
        if ($request->is_default) {
            $request->user()->addresses()->update(['is_default' => false]);
        }
        $address->update($request->validated());
        return response()->json(['message' => 'Address updated', 'data' => new AddressResource($address->fresh())]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $request->user()->addresses()->findOrFail($id)->delete();
        return response()->json(['message' => 'Address deleted']);
    }

    public function setDefault(Request $request, int $id): JsonResponse
    {
        $request->user()->addresses()->update(['is_default' => false]);
        $request->user()->addresses()->findOrFail($id)->update(['is_default' => true]);
        return response()->json(['message' => 'Default address updated']);
    }
}
