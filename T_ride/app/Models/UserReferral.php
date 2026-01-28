<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserReferral extends Model
{
    use HasFactory;

    protected $fillable = [
        'referrer_id',
        'referee_id',
        'campaign_id',
        'referral_code',
        'status',
        'reward_amount',
        'completed_at',
    ];

    protected $casts = [
        'reward_amount' => 'decimal:2',
        'completed_at' => 'datetime',
    ];

    public function referrer()
    {
        return $this->belongsTo(User::class, 'referrer_id');
    }

    public function referee()
    {
        return $this->belongsTo(User::class, 'referee_id');
    }

    public function campaign()
    {
        return $this->belongsTo(ReferralCampaign::class);
    }
}
