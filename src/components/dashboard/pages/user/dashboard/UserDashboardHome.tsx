import DailyAIOutlook from "./DailyAIOutlook";
import ExploreSection from "./ExploreSection";
import HighConfidenceSetup from "./HighConfidenceSetup";
import RecentAlerts from "./RecentAlerts";
import TopOpportunities from "./TopOpportunities";

const UserDashboardHome = () => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Opportunities */}
        <TopOpportunities />
        {/* Recent Alerts */}
        <RecentAlerts />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily AI Outlook */}
        <div className="lg:col-span-2">
          <DailyAIOutlook />
        </div>
        {/* High Confidence Setup */}
        <div className="lg:col-span-1">
          <HighConfidenceSetup />
        </div>
      </div>

      {/* Explore Section */}
      <ExploreSection />
    </div>
  );
};

export default UserDashboardHome;
