export const dynamic = "force-dynamic";

import { Navbar } from "@/components/Navbar";
import { KpiCards } from "@/components/analytics/KpiCards";
import { SwipeDirectionDonut } from "@/components/analytics/SwipeDirectionDonut";
import { SwipeVolumeChart } from "@/components/analytics/SwipeVolumeChart";
import { TopGadgetsChart } from "@/components/analytics/TopGadgetsChart";
import { CategoryPopularityChart } from "@/components/analytics/CategoryPopularityChart";
import { PriceVsLikeRateChart } from "@/components/analytics/PriceVsLikeRateChart";
import { ViewDurationChart } from "@/components/analytics/ViewDurationChart";
import { SourcePerformanceChart } from "@/components/analytics/SourcePerformanceChart";
import { UserSessionsHistogram } from "@/components/analytics/UserSessionsHistogram";
import { ConversionFunnel } from "@/components/analytics/ConversionFunnel";
import {
  getKpiData,
  getSwipeDistribution,
  getDailyActivity,
  getTopGadgets,
  getCategoryPopularity,
  getPriceVsLikeRate,
  getAvgDurationByDirection,
  getSourcePerformance,
  getUserSessionDistribution,
  getConversionFunnel,
} from "@/lib/analytics";

export default async function DashboardPage() {
  const [
    kpis,
    swipeDistribution,
    dailyActivity,
    topGadgets,
    categoryPopularity,
    priceVsLikeRate,
    avgDuration,
    sourcePerformance,
    userSessions,
    funnel,
  ] = await Promise.all([
    getKpiData(),
    getSwipeDistribution(),
    getDailyActivity(30),
    getTopGadgets(10),
    getCategoryPopularity(),
    getPriceVsLikeRate(),
    getAvgDurationByDirection(),
    getSourcePerformance(),
    getUserSessionDistribution(),
    getConversionFunnel(),
  ]);

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="px-4 lg:px-8 pt-20 pb-12 max-w-7xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-text-primary">
          Admin Dashboard
        </h1>

        {/* ROW 1: KPI Cards */}
        <KpiCards {...kpis} />

        {/* ROW 2: Core Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SwipeDirectionDonut data={swipeDistribution} />
          <SwipeVolumeChart data={dailyActivity} />
        </div>

        {/* ROW 3: Gadget Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TopGadgetsChart data={topGadgets} />
          <CategoryPopularityChart data={categoryPopularity} />
        </div>

        {/* ROW 4: Behavioral Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PriceVsLikeRateChart data={priceVsLikeRate} />
          <ViewDurationChart data={avgDuration} />
        </div>

        {/* ROW 5: Source & Retention */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SourcePerformanceChart data={sourcePerformance} />
          <UserSessionsHistogram data={userSessions} />
        </div>

        {/* ROW 6: Funnel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ConversionFunnel data={funnel} />
        </div>
      </main>
    </div>
  );
}
