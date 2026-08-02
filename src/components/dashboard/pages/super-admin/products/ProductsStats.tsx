"use client";
import { useGetProductStatsQuery } from "@/redux/api/product/productApi";
import StatsCard from "@/components/shared/StatsCard";

export default function ProductsStats() {
  const { data: statsData, isLoading } = useGetProductStatsQuery();

  if (isLoading || !statsData) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <StatsCard 
            key={i} 
            title="Loading..." 
            icon="FaBoxOpen" 
            isLoading 
          />
        ))}
      </div>
    );
  }

  const stats = statsData.data;

  const cards = [
    {
      title: "Total Products",
      value: stats?.totalProducts,
      iconName: "FaBoxOpen" as const,
      color: "text-brand",
      bgColor: "bg-brand/10",
    },
    {
      title: "Active Products",
      value: stats?.activeProducts,
      iconName: "CheckCircle" as const,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      title: "Low/Out of Stock",
      value: (stats?.lowStock || 0) + (stats?.outOfStock || 0),
      iconName: "AlertCircle" as const,
      color: "text-warning",
      bgColor: "bg-warning/10",
      subText: (stats?.outOfStock || 0) > 0 ? `${stats?.outOfStock} completely out of stock` : undefined,
    },
    {
      title: "Total Value",
      value: `৳${stats?.totalInventoryValue.toLocaleString()}`,
      iconName: "RiExchangeDollarLine" as const,
      color: "text-kpi-purple",
      bgColor: "bg-kpi-purple/10",
      subText: `Retail: ৳${stats?.totalRetailValue.toLocaleString()}`,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, i) => (
        <StatsCard
          key={i}
          title={card.title}
          value={card.value}
          icon={card.iconName}
          iconColor={card.color}
          iconBgColor={card.bgColor}
          subText={card.subText}
        />
      ))}
    </div>
  );
}
