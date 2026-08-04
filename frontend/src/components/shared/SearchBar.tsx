"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";

// Brand palette: Ink Navy #1B2A41 · Canvas Cream #F5EEDE · Surface Cream #FBF8F1
// Marigold Gold #C6941E (highlights/focus) · Brick Maroon #7A2A28 (accents)

type Props = {
  placeholder?: string;
  onSearch?: (value: string) => void;
  value?: string; // Optional: Allows parent to control resetting it externally
};

export default function SearchBar({
  placeholder = "Search products...",
  onSearch,
  value = "",
}: Props) {
  const [query, setQuery] = useState(value);

  // Sync state if the parent component clears filters externally
  useEffect(() => {
    setQuery(value);
  }, [value]);

  const handleTextChange = (text: string) => {
    setQuery(text);
    if (onSearch) onSearch(text);
  };

  const handleClear = () => {
    setQuery("");
    if (onSearch) onSearch(""); // Instantly signals the parent to clear search constraints
  };

  return (
    <div className="flex items-center w-full gap-2 max-w-md">
      <div className="relative flex-1 group">
        {/* Search Glass Icon */}
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1B2A41]/40 w-4 h-4 transition-colors group-focus-within:text-[#C6941E]" />

        <Input
          value={query}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder={placeholder}
          className="pl-10 pr-10 h-11 w-full rounded-xl bg-[#FBF8F1] border-[#1B2A41]/15 focus-visible:ring-[#C6941E] focus-visible:border-[#C6941E] text-sm text-[#1B2A41] shadow-sm"
        />

        {/* Clear Search Button (Visible only when text exists) */}
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 p-0.5 rounded-md hover:bg-[#1B2A41]/5 text-[#1B2A41]/40 hover:text-[#1B2A41] transition-colors"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}