import AssetCard from "@/components/shared/AssetCard";

const exploreData = [
  { id: 1, symbol: "AAPL", name: "Apple Inc.", price: 241.5, change: "+$3.24" },
  {
    id: 2,
    symbol: "SPCX",
    name: "Space Exploration Technologies.",
    price: 241.5,
    change: "+$3.24",
  },
  {
    id: 3,
    symbol: "KRAKEN",
    name: "Payward Inc.",
    price: 241.5,
    change: "-$3.24",
  },
  {
    id: 4,
    symbol: "STRIPE",
    name: "Stripe Inc.",
    price: 241.5,
    change: "+$3.24",
  },
  {
    id: 5,
    symbol: "AMZN",
    name: "Amazon.com Inc.",
    price: 134.25,
    change: "+$2.15",
  },
  {
    id: 6,
    symbol: "TSLA",
    name: "Tesla Inc.",
    price: 720.4,
    change: "+$15.50",
  },
  {
    id: 7,
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    price: 2890.5,
    change: "-$20.00",
  },
  {
    id: 8,
    symbol: "MSFT",
    name: "Microsoft Corporation",
    price: 300.1,
    change: "+$4.85",
  },
  {
    id: 9,
    symbol: "META",
    name: "Meta Platforms, Inc.",
    price: 315.45,
    change: "+$5.30",
  },
  {
    id: 10,
    symbol: "NFLX",
    name: "Netflix, Inc.",
    price: 562.3,
    change: "+$8.90",
  },
  {
    id: 11,
    symbol: "NVDA",
    name: "NVIDIA Corporation",
    price: 230.0,
    change: "-$3.60",
  },
  {
    id: 12,
    symbol: "ADBE",
    name: "Adobe Inc.",
    price: 650.8,
    change: "+$10.50",
  },
];

const ExploreSection = () => {
  return (
    <div className="flex flex-col gap-4 mt-6">
      <h2 className="text-foreground text-xl font-bold tracking-tight mb-2">
        Explore
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {exploreData.map((asset) => (
          <AssetCard
            key={asset.id}
            symbol={asset.symbol}
            name={asset.name}
            price={asset.price}
            change={asset.change}
          />
        ))}
      </div>
    </div>
  );
};

export default ExploreSection;
