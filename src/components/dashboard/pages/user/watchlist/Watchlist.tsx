"use client";

import { Pagination } from "@/components/dashboard/pagination";
import AiConfidenceMeter from "@/components/shared/AiConfidenceMeter";
import ConfirmModal from "@/components/shared/ConfirmModal";
import { motion } from "framer-motion";
import { Eye, Trash2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const MOCK_WATCHLIST = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    price: 241.5,
    change: 3.24,
    confidence: 64,
    volume: "24M",
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corporation",
    price: 315.45,
    change: 4.15,
    confidence: 58,
    volume: "18M",
  },
  {
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    price: 126.0,
    change: 2.75,
    confidence: 70,
    volume: "15M",
  },
  {
    symbol: "AMZN",
    name: "Amazon.com, Inc.",
    price: 138.9,
    change: -1.6,
    confidence: 62,
    volume: "20M",
  },
  {
    symbol: "TSLA",
    name: "Tesla, Inc.",
    price: 707.1,
    change: 9.05,
    confidence: 53,
    volume: "12M",
  },
  {
    symbol: "META",
    name: "Meta Platforms, Inc.",
    price: 325.5,
    change: -5.3,
    confidence: 59,
    volume: "10M",
  },
  {
    symbol: "NFLX",
    name: "Netflix, Inc.",
    price: 487.75,
    change: 8.1,
    confidence: 67,
    volume: "8M",
  },
  {
    symbol: "NVDA",
    name: "NVIDIA Corporation",
    price: 220.3,
    change: -6.25,
    confidence: 72,
    volume: "9M",
  },
  {
    symbol: "ADBE",
    name: "Adobe Inc.",
    price: 550.9,
    change: 10.5,
    confidence: 65,
    volume: "7M",
  },
  {
    symbol: "PYPL",
    name: "PayPal Holdings, Inc.",
    price: 88.45,
    change: 1.75,
    confidence: 50,
    volume: "6M",
  },
  {
    symbol: "INTC",
    name: "Intel Corporation",
    price: 30.8,
    change: -0.4,
    confidence: 48,
    volume: "5M",
  },
];

const ITEMS_PER_PAGE = 5;

export default function Watchlist() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState(MOCK_WATCHLIST);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const currentPage = Number(searchParams.get("page")) || 1;
  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);

  // Pagination logic
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentData = data.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleDelete = async () => {
    if (itemToDelete) {
      setIsDeleting(true);
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setData((prev) => prev.filter((item) => item.symbol !== itemToDelete));
      toast.success(
        `${itemToDelete} has been successfully removed from your watchlist.`,
      );

      setIsDeleting(false);
      setItemToDelete(null);
    }
  };

  return (
    <div className="w-full h-full flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">My Watchlist</h1>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="bg-brand/2 border border-border rounded-24 overflow-hidden flex-1 shadow-2xl"
      >
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-225">
            <thead>
              <tr className="border-b border-foreground/10 text-muted-foreground text-sm font-medium">
                <th className="px-6 py-5">Symbol</th>
                <th className="px-6 py-5">Stock Price</th>
                <th className="px-6 py-5">Change</th>
                <th className="px-6 py-5">AI Confidence</th>
                <th className="px-6 py-5">Volume</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-foreground/10">
              {currentData.map((item, index) => (
                <motion.tr
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  key={item.symbol}
                  className="hover:bg-brand/3 transition-colors group"
                >
                  {/* Symbol */}
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10.5 h-10.5 rounded-full bg-foreground flex items-center justify-center shrink-0 shadow-md">
                        <span className="text-background font-extrabold text-lg">
                          {item.symbol[0]}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-foreground text-base">
                          {item.symbol}
                        </div>
                        <div className="text-[13px] text-muted-foreground mt-0.5">
                          {item.name}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Stock Price */}
                  <td className="px-6 py-5 font-normal text-foreground text-[15px]">
                    ${item.price.toFixed(2)}
                  </td>

                  {/* Change */}
                  <td className="px-6 py-5 font-normal text-[15px]">
                    <span
                      className={
                        item.change >= 0 ? "text-success" : "text-error"
                      }
                    >
                      {item.change > 0 ? "+" : ""}
                      {item.change.toFixed(2)}
                    </span>
                  </td>

                  {/* AI Confidence */}
                  <td className="px-6 py-5 w-62.5">
                    <AiConfidenceMeter value={item.confidence} />
                  </td>

                  {/* Volume */}
                  <td className="px-6 py-5 font-normal text-foreground text-[15px]">
                    {item.volume}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-2 items-center">
                      <motion.button
                        // whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="text-muted-foreground hover:text-brand transition-colors p-2.5 rounded-full hover:bg-brand/10 hover:cursor-pointer"
                        title="View Asset Details"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(
                            `/dashboard/user/asset/${item.symbol.toLowerCase()}`,
                          );
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        // whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-2 px-4 py-2.5 bg-error/10 hover:bg-error/20 text-error rounded-[10px] font-medium transition-colors text-sm hover:cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          setItemToDelete(item.symbol);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                        Remove
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}

              {currentData.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-16 text-muted-foreground"
                  >
                    Your watchlist is empty.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {data.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={data.length}
            itemsPerPage={ITEMS_PER_PAGE}
          />
        </motion.div>
      )}

      <ConfirmModal
        open={!!itemToDelete}
        title="Remove from Watchlist"
        description={`Are you sure you want to remove ${itemToDelete} from your watchlist?`}
        confirmText="Remove"
        tone="danger"
        loading={isDeleting}
        onConfirm={handleDelete}
        onClose={() => !isDeleting && setItemToDelete(null)}
      />
    </div>
  );
}
