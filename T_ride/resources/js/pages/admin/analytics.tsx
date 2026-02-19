import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { AdminLayout } from '@/layouts/admin-layout';
import { 
    DollarSign, TrendingUp, Users, Activity, 
    BarChart3, PieChart as PieChartIcon, Target, Search, Filter, Download, ChevronDown, Check, Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
    DropdownMenu, 
    DropdownMenuTrigger, 
    DropdownMenuContent, 
    DropdownMenuItem 
} from '@/components/ui/dropdown-menu';
import { OverviewTab } from '../../components/admin/analytics/OverviewTab';
import { RevenueDeepDiveTab } from '../../components/admin/analytics/RevenueDeepDiveTab';
import { DemandPatternsTab } from '../../components/admin/analytics/DemandPatternsTab';
import { CohortAnalysisTab } from '../../components/admin/analytics/CohortAnalysisTab';
import { GeographicIntelligenceTab } from '../../components/admin/analytics/GeographicIntelligenceTab';
import { KPIScorecardTab } from '../../components/admin/analytics/KPIScorecardTab';
import { ConversionFunnelTab } from '../../components/admin/analytics/ConversionFunnelTab';
import { PredictiveAnalyticsTab } from '../../components/admin/analytics/PredictiveAnalyticsTab';

const tabs = [
    "Overview", 
    "Revenue Deep Dive", 
    "Demand Patterns", 
    "Cohort Analysis", 
    "Geographic Intelligence", 
    "KPI Scorecard", 
    "Conversion Funnel", 
    "Predictive Analytics"
];

export default function Analytics() {
    const [activeTab, setActiveTab] = useState("Overview");
    const [dateRange, setDateRange] = useState("Last 30 Days");

    const dateRanges = ["Last 7 Days", "Last 30 Days", "This Month", "This Quarter", "This Year", "Custom Range"];

    return (
        <AdminLayout
            title="Analytics & Business Intelligence"
            description="Real-time performance metrics, predictive insights, and cohort analysis"
            actions={
                <div className="flex gap-2">
                    <DropdownMenu>
                         <DropdownMenuTrigger asChild>
                            <Button variant="secondary" className="bg-tride-card border-tride-border text-tride-text">
                                <span className="mr-2">{dateRange}</span>
                                <ChevronDown size={14} />
                            </Button>
                         </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 bg-tride-card border-tride-border text-tride-text">
                            {dateRanges.map((range) => (
                                <DropdownMenuItem 
                                    key={range} 
                                    className="hover:bg-tride-hover focus:bg-tride-hover cursor-pointer"
                                    onClick={() => setDateRange(range)}
                                >
                                    {dateRange === range && <Check size={14} className="mr-2 text-tride-yellow" />}
                                    {range}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Button variant="secondary" className="bg-tride-card border-tride-border text-tride-text">
                        <Filter size={18} className="mr-2" />
                        Filters
                    </Button>
                    <Button className="bg-[#fbbf24] hover:bg-[#f59e0b] text-black font-bold">
                        <Download size={18} className="mr-2" />
                        Export
                    </Button>
                </div>
            }
        >
            <Head title="Analytics & BI" />

            {/* Top Analysis Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
                <AnalysisCard 
                    label="Total Revenue" 
                    value="$3.18M" 
                    trend="+18.5%" 
                    trendUp={true}
                    icon={<DollarSign size={20} className="text-blue-500" />} 
                />
                <AnalysisCard 
                    label="Total Trips" 
                    value="456K" 
                    trend="+12.3%" 
                    trendUp={true}
                    icon={<Activity size={20} className="text-blue-500" />} 
                />
                <AnalysisCard 
                    label="Active Users" 
                    value="89K" 
                    trend="+8.7%" 
                    trendUp={true}
                    icon={<Users size={20} className="text-blue-500" />} 
                />
                <AnalysisCard 
                    label="Driver Utilization" 
                    value="78%" 
                    trend="+5.2%" 
                    trendUp={true}
                    icon={<Target size={20} className="text-blue-500" />} 
                />
                <AnalysisCard 
                    label="Avg Trip Value" 
                    value="$18.50" 
                    trend="+2.3%" 
                    trendUp={true}
                    icon={<TrendingUp size={20} className="text-blue-500" />} 
                />
                <AnalysisCard 
                    label="Customer NPS" 
                    value="72" 
                    trend="+4" 
                    trendUp={true}
                    icon={<Star size={20} className="text-blue-500" />} 
                />
            </div>

            {/* Tabs Navigation */}
            <div className="flex gap-1 mb-6 bg-tride-card p-1 rounded-2xl w-fit border border-tride-border overflow-x-auto max-w-full no-scrollbar">
                {tabs.map((tab) => (
                    <Button
                        key={tab}
                        variant={activeTab === tab ? "default" : "ghost"}
                        onClick={() => setActiveTab(tab)}
                        className={`rounded-xl whitespace-nowrap transition-all duration-300 ${
                            activeTab === tab 
                            ? "bg-[#fbbf24] text-black font-bold border-none shadow-lg" 
                            : "text-tride-text-muted hover:text-tride-text hover:bg-tride-hover"
                        }`}
                    >
                        {tab}
                    </Button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {activeTab === "Overview" && <OverviewTab />}
                {activeTab === "Revenue Deep Dive" && <RevenueDeepDiveTab />}
                {activeTab === "Demand Patterns" && <DemandPatternsTab />}
                {activeTab === "Cohort Analysis" && <CohortAnalysisTab />}
                {activeTab === "Geographic Intelligence" && <GeographicIntelligenceTab />}
                {activeTab === "KPI Scorecard" && <KPIScorecardTab />}
                {activeTab === "Conversion Funnel" && <ConversionFunnelTab />}
                {activeTab === "Predictive Analytics" && <PredictiveAnalyticsTab />}
                {/* Fallback for tabs not yet implemented */}
                {!["Overview", "Revenue Deep Dive", "Demand Patterns", "Cohort Analysis", "Geographic Intelligence", "KPI Scorecard", "Conversion Funnel", "Predictive Analytics"].includes(activeTab) && (
                    <div className="bg-tride-card border border-tride-border p-20 rounded-3xl flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-tride-hover rounded-full flex items-center justify-center mb-4">
                            <BarChart3 size={32} className="text-tride-text-muted opacity-50" />
                        </div>
                        <h3 className="text-xl font-bold text-tride-text mb-2">{activeTab}</h3>
                        <p className="text-tride-text-muted max-w-md">Detailed visualization and data for {activeTab} will be available in the next system update.</p>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}

function AnalysisCard({ label, value, trend, trendUp, icon }: { label: string, value: string, trend: string, trendUp: boolean, icon: React.ReactNode }) {
    return (
        <div className="bg-tride-card border border-tride-border p-6 rounded-3xl relative overflow-hidden hover:bg-tride-hover/30 transition-all duration-300 group">
            <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                    {icon}
                </div>
                 <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${
                    trendUp ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                }`}>
                    {trend}
                </span>
            </div>
            <p className="text-xs text-tride-text-muted font-bold uppercase tracking-wider mb-1">{label}</p>
            <h3 className="text-2xl font-black text-tride-text group-hover:text-[#fbbf24] transition-colors">{value}</h3>
        </div>
    )
}
