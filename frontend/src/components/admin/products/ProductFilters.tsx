"use client";

import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

type Props = {
    search: string;
    setSearch: (v: string) => void;

    category: string;
    setCategory: (v: string) => void;

    status: string;
    setStatus: (v: string) => void;
    disabled:boolean
};

export default function ProductFilters({
    search,
    setSearch,
    category,
    setCategory,
    status,
    setStatus,
    disabled,
}: Props) {
    return (
        <div
            className="
            grid gap-4
            lg:grid-cols-3
        "
        >
            <div className="relative">

                <Search
                    className="
                    absolute left-3 top-1/2
                    -translate-y-1/2
                    h-4 w-4 text-zinc-400
                "
                />

                <Input
                    value={search}
                    onChange={(e) =>
                        setSearch(
                            e.target.value
                        )
                    }
                    placeholder="Search products..."
                    className="pl-10 bg-white"
                />

            </div>

            <Select
                value={category}
                onValueChange={
                    setCategory
                }
            >
                <SelectTrigger className="cursor-pointer">
                    <SelectValue placeholder="Category" />
                </SelectTrigger>

                <SelectContent className="cursor-pointer">
                    <SelectItem value="all">
                        All Categories
                    </SelectItem>

                    <SelectItem value="Tote Bag">
                        Tote Bag
                    </SelectItem>

                    <SelectItem value="Tshirts">
                        Tshirts
                    </SelectItem>
                </SelectContent>
            </Select>

            <Select
                value={status}
                onValueChange={setStatus}
            >
                <SelectTrigger className="cursor-pointer">
                    <SelectValue placeholder="Status" />
                </SelectTrigger>

                <SelectContent>

                    <SelectItem value="all">
                        All Status
                    </SelectItem>

                    <SelectItem value="ACTIVE">
                        Active
                    </SelectItem>

                    <SelectItem value="DRAFT">
                        Draft
                    </SelectItem>

                    <SelectItem value="ARCHIVED">
                        Archived
                    </SelectItem>

                </SelectContent>
            </Select>
        </div>
    );
}