
import { useState } from "react"
import { AdminLayout } from "@/layouts/admin-layout"
import { Head } from "@inertiajs/react"
import { Button } from "@/components/ui/button"
import { 
  DollarSign, 
  BarChart3, 
  Users, 
  TrendingUp, 
  Store, 
  Receipt,
  Download
} from "lucide-react"

export default function Reports() {
  const [isExporting, setIsExporting] = useState(false)
  const reportCards = [
    {
      title: "Revenue Report",
      description: "Financial summary by period",
      icon: <DollarSign className="w-6 h-6 text-blue-500" />,
      bg: "bg-blue-500/10"
    },
    {
      title: "Trip Analytics",
      description: "Ride and delivery statistics",
      icon: <BarChart3 className="w-6 h-6 text-blue-500" />,
      bg: "bg-blue-500/10"
    },
    {
      title: "Driver Performance",
      description: "Driver metrics and ratings",
      icon: <Users className="w-6 h-6 text-blue-500" />,
      bg: "bg-blue-500/10"
    },
    {
      title: "User Growth",
      description: "Registration and activity trends",
      icon: <TrendingUp className="w-6 h-6 text-blue-500" />,
      bg: "bg-blue-500/10"
    },
    {
      title: "Vendor Sales",
      description: "Restaurant and shop performance",
      icon: <Store className="w-6 h-6 text-blue-500" />,
      bg: "bg-blue-500/10"
    },
    {
      title: "Settlement Report",
      description: "Payout summaries",
      icon: <Receipt className="w-6 h-6 text-blue-500" />,
      bg: "bg-blue-500/10"
    }
  ]

  return (
    <AdminLayout
      title="Reports"
      description="Analytics and business reports"
      // actions={
      //   <div className="flex gap-2">
      //      <Button 
      //        variant="secondary" 
      //        onClick={() => {
      //          setIsExporting(true);
      //          // Mock export delay
      //          setTimeout(() => setIsExporting(false), 2000);
      //        }} 
      //        disabled={isExporting}
      //      >
      //         {isExporting ? (
      //           <>
      //             <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
      //             Exporting...
      //           </>
      //         ) : (
      //           <>
      //             <Download size={18} />
      //             Export All
      //           </>
      //         )}
      //      </Button>
      //   </div>
      // }
    >
      <Head title="Reports - T-RIDE Admin" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportCards.map((card, index) => (
          <div 
            key={index}
            className="bg-tride-card border border-tride-border rounded-xl p-6 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className={`w-12 h-12 ${card.bg} rounded-lg flex items-center justify-center shrink-0`}>
              {card.icon}
            </div>
            <div>
              <h3 className="text-lg font-bold text-tride-text">{card.title}</h3>
              <p className="text-tride-text-muted text-sm">{card.description}</p>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  )
}
