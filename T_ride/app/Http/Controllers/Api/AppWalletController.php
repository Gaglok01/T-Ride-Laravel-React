<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\WalletTransaction;
use App\Models\WithdrawalRequest;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class AppWalletController extends Controller
{
    /**
     * Get wallet balance and transaction history
     */
    public function getWalletData()
    {
        $user = Auth::user();
        
        $transactions = WalletTransaction::where('user_id', $user->id)
            ->latest()
            ->limit(20)
            ->get();

        return response()->json([
            'status' => true,
            'data' => [
                'balance' => (float)$user->wallet_balance,
                'transactions' => $transactions
            ]
        ]);
    }

    /**
     * Add money to wallet
     */
    public function addMoney(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'amount' => 'required|numeric|min:1',
            'payment_method' => 'required|string', // Card, Mobile Money, Bank Transfer
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => false, 'message' => $validator->errors()->first()], 422);
        }

        $user = User::find(Auth::id());
        $amount = $request->amount;
        $balanceBefore = $user->wallet_balance;

        DB::beginTransaction();
        try {
            // In a real scenario, you'd process payment here via a gateway
            
            $user->wallet_balance += $amount;
            $user->save();

            $transaction = WalletTransaction::create([
                'user_id' => $user->id,
                'amount' => $amount,
                'balance_before' => $balanceBefore,
                'balance_after' => $user->wallet_balance,
                'type' => 'credit',
                'transaction_type' => 'deposit',
                'status' => 'completed',
                'description' => 'Money added via ' . $request->payment_method,
            ]);

            DB::commit();

            return response()->json([
                'status' => true,
                'message' => 'Money added successfully',
                'data' => [
                    'new_balance' => (float)$user->wallet_balance,
                    'transaction' => $transaction
                ]
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['status' => false, 'message' => 'Failed to add money: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Request withdrawal
     */
    public function withdrawMoney(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'amount' => 'required|numeric|min:1',
            'payment_method' => 'required|string', // Card, Mobile Money, Bank Transfer
            'account_number' => 'required_if:payment_method,Bank Transfer|string',
            'iban' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => false, 'message' => $validator->errors()->first()], 422);
        }

        $user = User::find(Auth::id());
        $amount = $request->amount;

        if ($user->wallet_balance < $amount) {
            return response()->json(['status' => false, 'message' => 'Insufficient balance'], 400);
        }

        DB::beginTransaction();
        try {
            $balanceBefore = $user->wallet_balance;
            
            // Deduct immediately (hold the amount)
            $user->wallet_balance -= $amount;
            $user->save();

            $withdrawal = WithdrawalRequest::create([
                'user_id' => $user->id,
                'amount' => $amount,
                'payment_method' => $request->payment_method,
                'account_number' => $request->account_number,
                'iban' => $request->iban,
                'status' => 'pending',
            ]);

            $transaction = WalletTransaction::create([
                'user_id' => $user->id,
                'amount' => $amount,
                'balance_before' => $balanceBefore,
                'balance_after' => $user->wallet_balance,
                'type' => 'debit',
                'transaction_type' => 'withdrawal',
                'status' => 'pending',
                'description' => 'Withdrawal request initiated',
                'reference_id' => $withdrawal->id
            ]);

            DB::commit();

            return response()->json([
                'status' => true,
                'message' => 'Withdrawal request submitted successfully',
                'data' => [
                    'new_balance' => (float)$user->wallet_balance,
                    'withdrawal' => $withdrawal
                ]
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['status' => false, 'message' => 'Failed to process withdrawal: ' . $e->getMessage()], 500);
        }
    }
}
