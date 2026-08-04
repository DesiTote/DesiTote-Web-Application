"use client";

import Link from "next/link";
import Image from "next/image";
import { ArchiveIcon, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

import ProductStatusBadge from "./ProductStatusBadge";
import { AdminProductsResponse } from "@/types/admin/product.type"; // Import your raw single Product interface
import { useArchiveProduct } from "@/hooks/admin/useProduct";

// Define strict prop types for the reusable component layout
interface ProductTableProps {
    products: AdminProductsResponse[]; // Array of single items, NOT the response envelope
    page: number;
    setPage: React.Dispatch<React.SetStateAction<number>>;
    disabled?: boolean;
    meta?: {
        totalItems: number;
        totalPages: number;
        currentPage: number;
        limit: number;
    };
}

// Builds a compact page-number list with ellipses, e.g. 1 … 4 5 6 … 12
function getPageNumbers(current: number, total: number): (number | "ellipsis")[] {
    const delta = 1; // pages to show on either side of current
    const range: (number | "ellipsis")[] = [];
    const rangeStart = Math.max(2, current - delta);
    const rangeEnd = Math.min(total - 1, current + delta);

    range.push(1);

    if (rangeStart > 2) {
        range.push("ellipsis");
    }

    for (let i = rangeStart; i <= rangeEnd; i++) {
        range.push(i);
    }

    if (rangeEnd < total - 1) {
        range.push("ellipsis");
    }

    if (total > 1) {
        range.push(total);
    }

    return range;
}

export default function ProductTable({
    products,
    page,
    setPage,
    disabled = false,
    meta,
}: ProductTableProps) {
    const { mutate: archiveProduct, isPending } = useArchiveProduct();

    const handleDeleteClick = (productId: string) => {
        if (confirm("Are you sure you want to archive this product?")) {
            archiveProduct(productId);
        }
    };

    const handlePageClick = (
        e: React.MouseEvent<HTMLAnchorElement>,
        targetPage: number
    ) => {
        e.preventDefault();
        if (disabled || !meta) return;
        if (targetPage < 1 || targetPage > meta.totalPages) return;
        setPage(targetPage);
    };

    return (
        <>
            {/* DESKTOP TABLE */}
            <Card className="hidden lg:block shadow-sm border-gray-100 overflow-hidden">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-gray-50/70">
                            <TableRow>
                                <TableHead className="w-[40%]">Product</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Stock</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right pr-6">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32 text-center text-gray-400">
                                        No active products found in matching catalog queries.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                products.map((product) => (
                                    <TableRow key={product._id} className="hover:bg-gray-50/40 transition-colors">
                                        <TableCell>
                                            <div className="flex items-center gap-4">
                                                <Image
                                                    src={product.thumbnail}
                                                    alt={product.title}
                                                    width={48}
                                                    height={48}
                                                    className="rounded-lg object-cover bg-gray-50 border w-12 h-12"
                                                />
                                                <div>
                                                    <p className="font-medium text-gray-900 capitalize">{product.title}</p>
                                                    <span className="text-xs text-gray-400 font-mono uppercase">{product.sku}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        {/* Adjusted to your actual schema property: productCategory */}
                                        <TableCell className="text-gray-500 font-medium">
                                            {product.productCategory}
                                        </TableCell>
                                        <TableCell className="font-medium text-gray-900">
                                            ₹{product.price}
                                        </TableCell>
                                        <TableCell>
                                            <span className={`font-semibold ${product.stock <= product.lowStockThreshold ? "text-red-500" : "text-green-600"}`}>
                                                {product.stock}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <ProductStatusBadge status={product.status} />
                                        </TableCell>
                                        <TableCell className="text-right pr-6">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild disabled={disabled}>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 cursor-pointer">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-36">
                                                    <Link href={`/manage-products/${product._id}`}>
                                                        <DropdownMenuItem className="cursor-pointer">
                                                            <Pencil className="mr-2 h-3.5 w-3.5 text-gray-500 cursor-pointer" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                    </Link>
                                                    <DropdownMenuItem
                                                        onClick={() => handleDeleteClick(product._id)}
                                                        disabled={isPending}
                                                        className="text-red-600 cursor-pointer focus:text-red-600 focus:bg-red-50"
                                                    >
                                                        <ArchiveIcon className="mr-2 h-3.5 w-3.5" />
                                                        Archive
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* MOBILE CARDS */}
            <div className="grid gap-4 lg:hidden">
                {products.length === 0 ? (
                    <div className="bg-white border rounded-xl p-8 text-center text-gray-400 text-sm">
                        No active products found matching parameters.
                    </div>
                ) : (
                    products.map((product) => (
                        <Card key={product._id} className="border-gray-100 shadow-sm">
                            <CardContent className="p-4">
                                <div className="flex gap-4">
                                    <Image
                                        src={product.thumbnail}
                                        alt={product.title}
                                        width={80}
                                        height={80}
                                        className="rounded-xl object-cover bg-gray-50 border w-20 h-20"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <h3 className="font-semibold text-gray-900 truncate capitalize">
                                                {product.title}
                                            </h3>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild disabled={disabled}>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 -mt-1 -mr-1 text-gray-400">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <Link href={`/manage-products/${product._id}`}>
                                                        <DropdownMenuItem>Edit</DropdownMenuItem>
                                                    </Link>
                                                    <DropdownMenuItem
                                                        onClick={() => handleDeleteClick(product._id)}
                                                        disabled={isPending}
                                                        className="text-red-600 cursor-pointer focus:text-red-600 focus:bg-red-50"
                                                    >
                                                        <ArchiveIcon className="mr-2 h-3.5 w-3.5 cursor-pointer" />
                                                        Archive
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                        <p className="text-xs text-gray-400 font-mono uppercase mt-0.5">{product.sku}</p>
                                        <p className="text-xs text-gray-500 mt-1">{product.productCategory}</p>

                                        <div className="mt-3 flex items-center justify-between">
                                            <p className="font-bold text-gray-900">₹{product.price}</p>
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs text-gray-500 font-medium">
                                                    Stock: <span className={product.stock <= product.lowStockThreshold ? "text-red-500 font-bold" : "text-gray-700"}>{product.stock}</span>
                                                </span>
                                                <ProductStatusBadge status={product.status} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* PAGINATION PANEL FOOTER */}
            {meta && meta.totalPages > 1 && (
                <div className="flex items-center justify-center p-4 bg-white border border-gray-100 rounded-xl shadow-xs mt-4">
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    href="#"
                                    onClick={(e) => handlePageClick(e, page - 1)}
                                    aria-disabled={page === 1 || disabled}
                                    className={
                                        page === 1 || disabled
                                            ? "pointer-events-none opacity-50"
                                            : "cursor-pointer"
                                    }
                                />
                            </PaginationItem>

                            {getPageNumbers(meta.currentPage, meta.totalPages).map(
                                (item, idx) =>
                                    item === "ellipsis" ? (
                                        <PaginationItem key={`ellipsis-${idx}`}>
                                            <PaginationEllipsis />
                                        </PaginationItem>
                                    ) : (
                                        <PaginationItem key={item}>
                                            <PaginationLink
                                                href="#"
                                                isActive={item === meta.currentPage}
                                                onClick={(e) => handlePageClick(e, item)}
                                                className={disabled ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                            >
                                                {item}
                                            </PaginationLink>
                                        </PaginationItem>
                                    )
                            )}

                            <PaginationItem>
                                <PaginationNext
                                    href="#"
                                    onClick={(e) => handlePageClick(e, page + 1)}
                                    aria-disabled={page >= meta.totalPages || disabled}
                                    className={
                                        page >= meta.totalPages || disabled
                                            ? "pointer-events-none opacity-50"
                                            : "cursor-pointer"
                                    }
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}
        </>
    );
}