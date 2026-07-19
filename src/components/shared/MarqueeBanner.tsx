"use client";

import React from "react";

interface MarqueeElement {
  stop: () => void;
  start: () => void;
}

export default function MarqueeBanner() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const MarqueeTag = "marquee" as any;

  return (
    <div className="w-full bg-red-600 text-white py-2 px-4 shadow-md font-medium text-sm md:text-base border-b border-red-700 select-none z-[9998] relative">
      <MarqueeTag 
        behavior="scroll" 
        direction="left" 
        scrollamount="12"
        className="flex items-center cursor-pointer"
        onMouseOver={(e: React.MouseEvent<HTMLElement>) => (e.currentTarget as unknown as MarqueeElement).stop()}
        onMouseOut={(e: React.MouseEvent<HTMLElement>) => (e.currentTarget as unknown as MarqueeElement).start()}
      >
        My Fiverr profile is currently temporarily restricted. However, I am still available to assist and support you throughout the project. Please feel free to communicate with me via email at: <span className="underline font-bold text-yellow-300">clientprogram39@gmail.com</span> Thank you for your understanding, and I look forward to assisting you.
      </MarqueeTag>
    </div>
  );
}
