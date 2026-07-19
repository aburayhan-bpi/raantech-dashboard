// components/ui/CustomDropdown.tsx
"use client";

import { cn } from "@/lib/utils";
import { Check, ChevronDown, Search } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";

interface DropdownOption {
  value: string;
  label: string;
}

interface CustomDropdownProps {
  options: DropdownOption[];
  placeholder?: string;
  value?: string;
  onChange: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  className?: string;
  dropdownClassName?: string;
  triggerClassName?: string;
  optionClassName?: string;
  openDirection?: "auto" | "up" | "down";
  isSearchable?: boolean;
  onSearchChange?: (searchValue: string) => void;
  isLoading?: boolean;
}

export const CustomDropdown = ({
  options,
  placeholder,
  value,
  onChange,
  className,
  dropdownClassName = "",
  triggerClassName = "",
  optionClassName = "",
  openDirection = "auto",
  isSearchable = false,
  onSearchChange,
  isLoading = false,
}: CustomDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const [dropdownDirection, setDropdownDirection] = useState<"up" | "down">(
    "down",
  );
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((option) => option.value === value);
  const [lastSelectedLabel, setLastSelectedLabel] = useState("");
  const [prevValue, setPrevValue] = useState(value);
  const [prevLabel, setPrevLabel] = useState("");

  // Sync state during rendering instead of useEffect
  if (value !== prevValue) {
    setPrevValue(value);
    if (!value) {
      setLastSelectedLabel("");
    }
  }

  if (selectedOption && selectedOption.label !== prevLabel) {
    setPrevLabel(selectedOption.label);
    setLastSelectedLabel(selectedOption.label);
  }

  const toggleDropdown = () => {
    setIsOpen((prev) => {
      const next = !prev;
      if (!next) {
        setSearchVal("");
        onSearchChange?.("");
      }
      return next;
    });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchVal("");
        onSearchChange?.("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onSearchChange]);

  useEffect(() => {
    if (!isOpen || openDirection === "down" || !dropdownRef.current) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      const dropdownTrigger = dropdownRef.current?.querySelector(
        "button[data-slot='dropdown-trigger']",
      ) as HTMLButtonElement | null;

      if (!dropdownTrigger) {
        return;
      }

      const triggerRect = dropdownTrigger.getBoundingClientRect();
      const estimatedDropdownHeight = Math.min(options.length * 52 + 16, 260);
      const spaceBelow = window.innerHeight - triggerRect.bottom;
      const spaceAbove = triggerRect.top;

      if (openDirection === "up") {
        setDropdownDirection("up");
        return;
      }

      setDropdownDirection(
        spaceBelow < estimatedDropdownHeight && spaceAbove > spaceBelow
          ? "up"
          : "down",
      );
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [isOpen, openDirection, options.length]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchVal("");
    onSearchChange?.("");
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchVal(val);
    onSearchChange?.(val);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const filteredOptions = useMemo(() => {
    if (onSearchChange) return options; // If API-based search is used, let parent handle filtering
    if (!searchVal.trim()) return options;
    return options.filter((option) =>
      option.label.toLowerCase().includes(searchVal.toLowerCase())
    );
  }, [options, searchVal, onSearchChange]);

  const dropdownPositionClass = useMemo(() => {
    if (dropdownDirection === "up") {
      return "bottom-full mb-2 top-auto";
    }

    return "top-full mt-2";
  }, [dropdownDirection]);

  return (
    <div className={cn("relative w-full", className)} ref={dropdownRef}>
      <button
        data-slot="dropdown-trigger"
        type="button"
        onClick={toggleDropdown}
        className={cn(
          "flex w-full items-center justify-between rounded-16 border border-border bg-white px-4 py-3 text-sm font-medium text-chart-text shadow-sm transition-all duration-200 hover:border-chart-border/30 hover:bg-chart-primary/5 focus:outline-none focus:ring-2 focus:ring-chart-primary/20",
          triggerClassName,
        )}
      >
        <span
          className={cn(
            "truncate text-left",
            !value &&
              "bg-linear-to-r from-chart-primary-dark to-chart-primary bg-clip-text text-transparent",
          )}
        >
          {value && lastSelectedLabel ? lastSelectedLabel : placeholder}
        </span>
        <ChevronDown
          className={cn(
            "ml-2 h-4 w-4 shrink-0 text-chart-border transition-transform duration-200",
            isOpen && "rotate-180",
          )}
        />
      </button>

      {isOpen && (
        <div
          className={cn(
            "absolute z-50 w-full overflow-hidden rounded-16 border border-border bg-white shadow-[0px_16px_40px_rgba(15,23,42,0.14)] animate-in fade-in-0 zoom-in-95",
            dropdownPositionClass,
            dropdownClassName,
          )}
        >
          {isSearchable && (
            <div className="p-2 border-b border-border bg-white sticky top-0 z-10">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchVal}
                  onChange={handleSearchChange}
                  onKeyDown={handleInputKeyDown}
                  className="w-full pl-9 pr-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand text-xs text-gray-700"
                />
              </div>
            </div>
          )}
          <div className="max-h-60 overflow-auto p-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-6 gap-2 text-xs text-brand font-medium">
                <svg className="animate-spin h-4 w-4 text-brand" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                <span>Loading options...</span>
              </div>
            ) : filteredOptions.length === 0 ? (
              <div className="text-center py-4 text-xs text-gray-400 font-medium">
                No options found
              </div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-16 px-3 py-2.5 text-sm text-chart-text-muted transition-colors duration-150 hover:bg-chart-primary/5 hover:text-chart-text",
                    optionClassName,
                  )}
                >
                  <span className="text-left">{option.label}</span>
                  {value === option.value && (
                    <Check className="h-4 w-4 text-chart-primary" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
