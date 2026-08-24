"use client";

import { useState } from "react"; // Added for controlling the mobile sheet
import { SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Sheet,
    SheetTrigger,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { GetProductsParams } from "@/types/customer/product.type";

// Brand palette: Ink Navy #1B2A41 · Canvas Cream #F5EEDE · Surface Cream #FBF8F1
// Marigold Gold #C6941E (buttons/highlights) · Brick Maroon #7A2A28 (tags/accents)

const ALL_CATEGORIES = "All Categories";
const CATEGORIES = ["Eco Friendly", "Printed", "Minimal", "Custom"];

const DEFAULT_FILTERS: GetProductsParams = {
    category: [],
    maxPrice: 500,
    sort: "default",
};

interface ShopSidebarProps {
    filters: GetProductsParams;
    onChange: (filters: GetProductsParams) => void;
    onApply: () => void;
    onClear: () => void;
    disabled: boolean;
}

export default function ShopSidebar({ filters, onChange, onApply, onClear, disabled }: ShopSidebarProps) {
    // State to control mobile sheet opening/closing
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const selectedCategories = filters.category ?? [];
    const isAllSelected = selectedCategories.length === 0;

    const hasActiveFilters =
        selectedCategories.length > 0 ||
        (filters.maxPrice ?? 500) !== DEFAULT_FILTERS.maxPrice ||
        (filters.sort ?? "default") !== DEFAULT_FILTERS.sort;

    const handleCategoryToggle = (category: string) => {
        if (category === ALL_CATEGORIES) {
            onChange({ ...filters, category: [] });
            return;
        }

        const isCurrentlySelected = selectedCategories.includes(category);
        const next = isCurrentlySelected
            ? selectedCategories.filter((c) => c !== category)
            : [...selectedCategories, category];

        onChange({ ...filters, category: next });
    };

    const handlePriceChange = (value: number[]) => {
        onChange({ ...filters, maxPrice: value[0] });
    };

    const handleSortChange = (value: string) => {
        // Keeps values direct and clean
        onChange({ ...filters, sort: value as GetProductsParams["sort"] });
    };

    // Combined handler to apply filters AND close the mobile view modal
    const handleApplyFilters = () => {
        onApply();
        setIsMobileOpen(false);
    };

    const filterContent = (
        <div className="space-y-6">
            {/* CATEGORY */}
            <div className="space-y-3">
                <h3 className="text-sm font-semibold text-[#1B2A41] tracking-wide uppercase">Category</h3>
                <div className="flex flex-col gap-3 text-sm text-[#1B2A41]/70">
                    <label
                        className={`flex items-center gap-2.5 font-medium select-none ${isAllSelected ? "opacity-70 cursor-default" : "cursor-pointer"
                            }`}
                    >
                        <Checkbox
                            id="all-categories"
                            checked={isAllSelected}
                            disabled={isAllSelected}
                            onCheckedChange={() => handleCategoryToggle(ALL_CATEGORIES)}
                            className="border-[#1B2A41]/25 data-[state=checked]:bg-[#C6941E] data-[state=checked]:border-[#C6941E]"
                        />
                        <span className="text-[#1B2A41]">{ALL_CATEGORIES}</span>
                    </label>

                    {CATEGORIES.map((category) => (
                        <label
                            key={category}
                            className="flex items-center gap-2.5 font-medium cursor-pointer select-none"
                        >
                            <Checkbox
                                // Bug fix: .replace(" ", "-") only swaps the first space, so any
                                // future multi-word category (e.g. "Hand Block Printed") would
                                // produce a malformed id. Using a global regex instead.
                                id={category.toLowerCase().replace(/\s+/g, "-")}
                                checked={selectedCategories.includes(category)}
                                onCheckedChange={() => handleCategoryToggle(category)}
                                className="border-[#1B2A41]/25 data-[state=checked]:bg-[#C6941E] data-[state=checked]:border-[#C6941E]"
                            />
                            <span className="text-[#1B2A41]">{category}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* PRICE SLIDER */}
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <h3 className="text-sm font-semibold text-[#1B2A41] tracking-wide uppercase">Max Price</h3>
                    <span className="text-sm font-bold text-[#7A2A28] bg-[#7A2A28]/10 px-2 py-0.5 rounded-md">
                        ₹{filters.maxPrice ?? 500}
                    </span>
                </div>
                <Slider
                    min={100}
                    max={1000}
                    step={10}
                    value={[filters.maxPrice ?? 500]}
                    onValueChange={handlePriceChange}
                    className="py-2 [&_[data-slot=slider-range]]:bg-[#C6941E] [&_[data-slot=slider-thumb]]:border-[#C6941E]"
                />
                <div className="flex justify-between text-[11px] font-medium text-[#1B2A41]/40">
                    <span>₹100</span>
                    <span>₹1000</span>
                </div>
            </div>

            {/* SORT BY */}
            <div className="space-y-3">
                <h3 className="text-sm font-semibold text-[#1B2A41] tracking-wide uppercase">Sort By</h3>
                <Select value={filters.sort ?? "default"} onValueChange={handleSortChange}>
                    <SelectTrigger className="w-full bg-[#FBF8F1] border-[#1B2A41]/15 focus:ring-[#C6941E] text-[#1B2A41] rounded-xl">
                        <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    {/* Value tags match backend strings ('price_asc' & 'price_desc') exactly so display value registers */}
                    <SelectContent className="bg-[#FBF8F1] border-[#1B2A41]/10 rounded-xl shadow-lg">
                        <SelectItem value="default" className="focus:bg-[#F5EEDE] focus:text-[#1B2A41]">Default</SelectItem>
                        <SelectItem value="price_asc" className="focus:bg-[#F5EEDE] focus:text-[#1B2A41]">Price Low → High</SelectItem>
                        <SelectItem value="price_desc" className="focus:bg-[#F5EEDE] focus:text-[#1B2A41]">Price High → Low</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* ACTION BUTTONS */}
            <div className="space-y-2 pt-2">
                <Button
                    onClick={handleApplyFilters}
                    disabled={disabled}
                    className="w-full cursor-pointer bg-[#1B2A41] hover:bg-[#FBF8F1] border border-[#1B2A41] text-[#FBF8F1] hover:text-[#1B2A41] font-semibold py-5 rounded-none transition-colors duration-200 shadow-sm"
                >
                    Apply Filters
                </Button>

                {hasActiveFilters && (
                    <Button
                        onClick={onClear}
                        variant="ghost"
                        className="w-full cursor-pointer text-[#1B2A41]/60 hover:text-[#1B2A41] hover:bg-[#1B2A41]/5 font-semibold py-5 rounded-xl transition-all flex items-center justify-center gap-1.5"
                    >
                        <X className="w-3.5 h-3.5" />
                        Clear Filters
                    </Button>
                )}
            </div>
        </div>
    );

    return (
        <>
            {/* MOBILE VIEW */}
            <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-11/12 max-w-sm">
                <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
                    <SheetTrigger asChild>
                        <Button className="w-full shadow-xl bg-[#1B2A41] hover:bg-[#141F32] text-[#FBF8F1] font-bold tracking-wide rounded-full py-6 flex items-center justify-center gap-2 border border-[#1B2A41]">
                            <SlidersHorizontal className="w-4 h-4 text-[#C6941E]" />
                            FILTER & SORT
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="bottom" className="rounded-t-[2rem] bg-[#FBF8F1] px-6 pb-8 pt-4 max-h-[85vh] overflow-y-auto border-t-[#1B2A41]/10">
                        <SheetHeader className="pb-4 border-b border-[#1B2A41]/10 mb-4">
                            <SheetTitle className="text-xl font-black text-[#1B2A41] flex items-center gap-2">
                                Filters
                            </SheetTitle>
                        </SheetHeader>
                        {filterContent}
                    </SheetContent>
                </Sheet>
            </div>

            {/* DESKTOP VIEW */}
            <aside className="hidden lg:block w-full bg-[#FBF8F1] p-6 rounded-2xl shadow-sm border border-[#1B2A41]/10 max-h-[calc(100vh-9.5rem)] overflow-y-auto">
                <div className="flex items-center gap-2 pb-4 border-b border-[#1B2A41]/10 mb-6">
                    <h2 className="text-lg font-black text-[#1B2A41] tracking-tight">Filters</h2>
                </div>
                {filterContent}
            </aside>
        </>
    );
}