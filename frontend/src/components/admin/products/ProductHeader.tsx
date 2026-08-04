"use client";

import Link from "next/link";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function ProductHeader() {
    return (
        <div
            className="
            flex flex-col gap-5
            lg:flex-row
            lg:items-center
            lg:justify-between
        "
        >
            <div>
                <h1 className="text-3xl font-bold text-zinc-900">
                    Product Management
                </h1>

                <p className="mt-2 text-zinc-600">
                    Manage inventory, pricing
                    and product listings.
                </p>
            </div>

            <Link href="/manage-products/add">
                <Button className="bg-[#166534] hover:bg-[#14532D] w-full lg:w-auto cursor-pointer">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Product
                </Button>
            </Link>
        </div>
    );
}