"use client"

import { Modal, ModalButton } from "@/components/ui/modal"
import { 
    Calendar, DollarSign, Target, Users, Gift, Share2, 
    CheckCircle, X, Tag, Crown, TrendingUp, Copy
} from "lucide-react"

// View Campaign Modal
interface ViewCampaignModalProps {
    isOpen: boolean
    onClose: () => void
    campaign: any | null
}

export function ViewCampaignModal({ isOpen, onClose, campaign }: ViewCampaignModalProps) {
    if (!campaign) return null

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'active': return 'bg-green-500/20 text-green-500'
            case 'scheduled': return 'bg-blue-500/20 text-blue-500'
            case 'paused': return 'bg-orange-500/20 text-orange-500'
            case 'ended': return 'bg-gray-500/20 text-gray-500'
            default: return 'bg-gray-500/20 text-gray-500'
        }
    }

    const progress = campaign.budget > 0 ? Math.min((campaign.spent / campaign.budget) * 100, 100) : 0

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Campaign Details"
            icon={<Gift size={20} />}
            size="lg"
            footer={
                <ModalButton onClick={onClose} variant="secondary">Close</ModalButton>
            }
        >
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="text-xl font-bold text-tride-text">{campaign.name}</h3>
                        <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(campaign.status)}`}>
                            {campaign.status}
                        </span>
                    </div>
                    <span className="px-3 py-1 bg-tride-hover rounded-xl text-xs font-medium text-tride-text capitalize">
                        {campaign.type}
                    </span>
                </div>

                {/* Description */}
                {campaign.description && (
                    <div className="bg-tride-hover/50 p-4 rounded-2xl">
                        <p className="text-sm text-tride-text-muted">{campaign.description}</p>
                    </div>
                )}

                {/* Budget Progress */}
                <div className="bg-tride-card border border-tride-border p-4 rounded-2xl">
                    <div className="flex justify-between mb-2">
                        <span className="text-sm text-tride-text-muted">Budget Progress</span>
                        <span className="text-sm font-bold text-tride-text">{progress.toFixed(1)}%</span>
                    </div>
                    <div className="h-3 w-full bg-tride-hover rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-gradient-to-r from-tride-yellow to-orange-500 rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <div className="flex justify-between mt-2">
                        <span className="text-xs text-tride-text-muted">Spent: <span className="text-tride-text font-bold">${Number(campaign.spent).toLocaleString()}</span></span>
                        <span className="text-xs text-tride-text-muted">Budget: <span className="text-tride-text font-bold">${Number(campaign.budget).toLocaleString()}</span></span>
                    </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <DetailItem icon={<Calendar size={16} />} label="Start Date" value={campaign.start_date ? new Date(campaign.start_date).toLocaleDateString() : 'Not set'} />
                    <DetailItem icon={<Calendar size={16} />} label="End Date" value={campaign.end_date ? new Date(campaign.end_date).toLocaleDateString() : 'Not set'} />
                    <DetailItem icon={<DollarSign size={16} />} label="Total Budget" value={`$${Number(campaign.budget).toLocaleString()}`} />
                    <DetailItem icon={<TrendingUp size={16} />} label="Amount Spent" value={`$${Number(campaign.spent).toLocaleString()}`} />
                </div>
            </div>
        </Modal>
    )
}

// View Referrer Modal (for Top Referrers)
interface ViewReferrerModalProps {
    isOpen: boolean
    onClose: () => void
    referrer: any | null
}

export function ViewReferrerModal({ isOpen, onClose, referrer }: ViewReferrerModalProps) {
    if (!referrer) return null

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Referrer Details"
            icon={<Users size={20} />}
            size="lg"
            footer={
                <ModalButton onClick={onClose} variant="secondary">Close</ModalButton>
            }
        >
            <div className="space-y-6">
                {/* Profile Header */}
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                        {referrer.name?.charAt(0) || '?'}
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-tride-text">{referrer.name}</h3>
                        <p className="text-sm text-tride-text-muted">{referrer.email}</p>
                        <span className="inline-block mt-1 px-3 py-1 rounded-full text-xs font-bold bg-tride-yellow/20 text-tride-yellow">
                            {referrer.tier || 'Bronze'} Tier
                        </span>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatBox label="Total Referrals" value={referrer.total_referrals || 0} color="text-blue-500" />
                    <StatBox label="Successful" value={referrer.successful_referrals || 0} color="text-green-500" />
                    <StatBox label="Conversion Rate" value={`${referrer.conversion_rate || 0}%`} color="text-purple-500" />
                    <StatBox label="Total Earnings" value={`$${Number(referrer.total_earnings || 0).toLocaleString()}`} color="text-tride-yellow" />
                </div>

                {/* Additional Details */}
                <div className="bg-tride-hover/50 p-4 rounded-2xl space-y-3">
                    <h4 className="font-semibold text-tride-text">Performance Summary</h4>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-tride-text-muted">Referral Success Rate</span>
                            <span className="font-bold text-tride-text">{referrer.conversion_rate || 0}%</span>
                        </div>
                        <div className="h-2 w-full bg-tride-hover rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-green-500 rounded-full"
                                style={{ width: `${referrer.conversion_rate || 0}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    )
}

// View Referral Code Modal
interface ViewReferralCodeModalProps {
    isOpen: boolean
    onClose: () => void
    code: any | null
}

export function ViewReferralCodeModal({ isOpen, onClose, code }: ViewReferralCodeModalProps) {
    if (!code) return null

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'completed': return 'bg-green-500/20 text-green-500'
            case 'pending': return 'bg-orange-500/20 text-orange-500'
            case 'expired': return 'bg-gray-500/20 text-gray-500'
            case 'fraud': return 'bg-red-500/20 text-red-500'
            default: return 'bg-gray-500/20 text-gray-500'
        }
    }

    const copyCode = () => {
        navigator.clipboard.writeText(code.referral_code)
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Referral Code Details"
            icon={<Tag size={20} />}
            size="lg"
            footer={
                <ModalButton onClick={onClose} variant="secondary">Close</ModalButton>
            }
        >
            <div className="space-y-6">
                {/* Code Display */}
                <div className="bg-tride-hover/50 p-6 rounded-2xl text-center">
                    <p className="text-sm text-tride-text-muted mb-2">Referral Code</p>
                    <div className="flex items-center justify-center gap-3">
                        <span className="text-3xl font-mono font-bold text-tride-text tracking-widest">{code.referral_code}</span>
                        <button 
                            onClick={copyCode}
                            className="p-2 bg-tride-card rounded-xl hover:bg-tride-border transition-colors text-tride-text-muted hover:text-tride-text"
                        >
                            <Copy size={18} />
                        </button>
                    </div>
                    <span className={`inline-block mt-3 px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(code.status)}`}>
                        {code.status}
                    </span>
                </div>

                {/* Users Info */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-tride-card border border-tride-border p-4 rounded-2xl">
                        <p className="text-xs text-tride-text-muted mb-2">Referrer</p>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 font-bold text-sm">
                                {code.referrer?.name?.charAt(0) || '?'}
                            </div>
                            <div>
                                <p className="font-medium text-tride-text text-sm">{code.referrer?.name || 'N/A'}</p>
                                <p className="text-xs text-tride-text-muted">{code.referrer?.email || ''}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-tride-card border border-tride-border p-4 rounded-2xl">
                        <p className="text-xs text-tride-text-muted mb-2">Referee</p>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 font-bold text-sm">
                                {code.referee?.name?.charAt(0) || '?'}
                            </div>
                            <div>
                                <p className="font-medium text-tride-text text-sm">{code.referee?.name || 'Pending'}</p>
                                <p className="text-xs text-tride-text-muted">{code.referee?.email || ''}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-4">
                    <DetailItem icon={<Gift size={16} />} label="Campaign" value={code.campaign?.name || 'General'} />
                    <DetailItem icon={<DollarSign size={16} />} label="Reward Amount" value={`$${code.reward_amount || 0}`} />
                    <DetailItem icon={<Calendar size={16} />} label="Created" value={code.created_at ? new Date(code.created_at).toLocaleDateString() : 'N/A'} />
                    <DetailItem icon={<CheckCircle size={16} />} label="Completed" value={code.completed_at ? new Date(code.completed_at).toLocaleDateString() : 'Not yet'} />
                </div>
            </div>
        </Modal>
    )
}

// View Rule Modal
interface ViewRuleModalProps {
    isOpen: boolean
    onClose: () => void
    rule: any | null
}

export function ViewRuleModal({ isOpen, onClose, rule }: ViewRuleModalProps) {
    if (!rule) return null

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Reward Rule Details"
            icon={<Target size={20} />}
            size="md"
            footer={
                <ModalButton onClick={onClose} variant="secondary">Close</ModalButton>
            }
        >
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="text-xl font-bold text-tride-text">{rule.name}</h3>
                        <div className="flex gap-2 mt-2">
                            <span className="px-2 py-1 bg-blue-500/20 text-blue-500 rounded-lg text-xs font-bold capitalize">
                                {rule.type}
                            </span>
                            <span className={`px-2 py-1 rounded-lg text-xs font-bold ${rule.is_active ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'}`}>
                                {rule.is_active ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-3xl font-bold text-tride-yellow">
                            {rule.reward_type === 'fixed' || rule.reward_type === 'credit' ? '$' : ''}{rule.reward_amount}{rule.reward_type === 'percentage' ? '%' : ''}
                        </p>
                        <p className="text-xs text-tride-text-muted capitalize">{rule.reward_type} reward</p>
                    </div>
                </div>

                {/* Description */}
                {rule.description && (
                    <div className="bg-tride-hover/50 p-4 rounded-2xl">
                        <p className="text-sm text-tride-text-muted">{rule.description}</p>
                    </div>
                )}

                {/* Details */}
                <div className="grid grid-cols-2 gap-4">
                    <DetailItem icon={<Target size={16} />} label="Trigger Event" value={rule.trigger_event?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || 'N/A'} />
                    <DetailItem icon={<DollarSign size={16} />} label="Reward Type" value={rule.reward_type?.charAt(0).toUpperCase() + rule.reward_type?.slice(1) || 'Fixed'} />
                </div>
            </div>
        </Modal>
    )
}

// View Tier Modal
interface ViewTierModalProps {
    isOpen: boolean
    onClose: () => void
    tier: any | null
}

export function ViewTierModal({ isOpen, onClose, tier }: ViewTierModalProps) {
    if (!tier) return null

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Tier Details"
            icon={<Crown size={20} />}
            size="md"
            footer={
                <ModalButton onClick={onClose} variant="secondary">Close</ModalButton>
            }
        >
            <div className="space-y-6">
                {/* Header */}
                <div className="text-center">
                    <div 
                        className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
                        style={{ backgroundColor: `${tier.color}20` }}
                    >
                        <Crown size={40} style={{ color: tier.color }} />
                    </div>
                    <h3 className="text-2xl font-bold text-tride-text">{tier.name}</h3>
                    <p className="text-sm text-tride-text-muted mt-1">
                        {tier.min_referrals} - {tier.max_referrals || '∞'} referrals
                    </p>
                </div>

                {/* Multiplier */}
                <div className="bg-tride-hover/50 p-6 rounded-2xl text-center">
                    <p className="text-sm text-tride-text-muted mb-1">Bonus Multiplier</p>
                    <p className="text-4xl font-bold text-tride-yellow">{tier.bonus_multiplier}x</p>
                    <p className="text-xs text-tride-text-muted mt-1">
                        {((tier.bonus_multiplier - 1) * 100).toFixed(0)}% bonus on all rewards
                    </p>
                </div>

                {/* Benefits */}
                <div>
                    <h4 className="font-semibold text-tride-text mb-3">Benefits</h4>
                    <ul className="space-y-2">
                        {(tier.benefits || ['Standard rewards']).map((benefit: string, idx: number) => (
                            <li key={idx} className="flex items-center gap-2 text-sm text-tride-text">
                                <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                                {benefit}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </Modal>
    )
}

// Helper Components
function DetailItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
    return (
        <div className="bg-tride-hover/50 p-3 rounded-xl flex items-center gap-3">
            <div className="text-tride-text-muted">{icon}</div>
            <div>
                <p className="text-xs text-tride-text-muted">{label}</p>
                <p className="font-medium text-tride-text text-sm">{value}</p>
            </div>
        </div>
    )
}

function StatBox({ label, value, color }: { label: string, value: string | number, color: string }) {
    return (
        <div className="bg-tride-card border border-tride-border p-4 rounded-2xl text-center">
            <p className="text-xs text-tride-text-muted mb-1">{label}</p>
            <p className={`text-xl font-bold ${color}`}>{value}</p>
        </div>
    )
}
