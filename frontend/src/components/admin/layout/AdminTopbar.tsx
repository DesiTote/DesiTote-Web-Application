"use client";

import { useState } from "react";
import { Menu, Bell, Search, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
    Avatar,
    AvatarFallback,
} from "@/components/ui/avatar";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import AdminSidebar from "./AdminSidebar";

export default function AdminTopbar() {
    const { user, isLoggingOut, logout } = useAuth();

    // Local state just for the mobile sheet's sidebar instance.
    // Mobile drawer should always render expanded, never collapsed.
    const [mobileCollapsed, setMobileCollapsed] = useState(false);

    const firstLetter =
        user?.fullName?.charAt(0)?.toUpperCase() || "A";

    return (
        <header className="h-16 border-b border-zinc-200 bg-[#F8FAFC]/95 flex items-center justify-between px-4 lg:px-6">

            {/* LEFT */}
            <div className="flex items-center gap-3">

                {/* Mobile Sidebar */}
                <Sheet>
                    <SheetTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="lg:hidden"
                        >
                            <Menu className="h-5 w-5" />
                        </Button>
                    </SheetTrigger>

                    <SheetContent
                        side="left"
                        className="w-[300px] bg-white border-zinc-200 p-0 overflow-y-auto"
                    >
                        <AdminSidebar
                            collapsed={mobileCollapsed}
                            setCollapsed={setMobileCollapsed}
                        />
                    </SheetContent>
                </Sheet>

                <h1 className="text-xl font-semibold text-zinc-900">
                    Admin Dashboard
                </h1>
            </div>

            {/* CENTER SEARCH */}
            {/* <div className="hidden md:flex relative w-[320px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
                <Input
                    placeholder="Search..."
                    className="pl-10 bg-white border-zinc-200 text-zinc-900"
                />
            </div> */}

            {/* RIGHT */}
            <div className="flex items-center gap-4">
                {/* <Button variant="ghost" size="icon">
                    <Bell className="h-5 w-5" />
                </Button> */}

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="outline-none">
                            <Avatar className="cursor-pointer">
                                <AvatarFallback className="bg-orange-500 text-white font-semibold">
                                    {firstLetter}
                                </AvatarFallback>
                            </Avatar>
                        </button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="w-48">
                        <div className="px-2 py-1.5 text-sm text-zinc-500 truncate">
                            {user?.fullName || "Admin"}
                        </div>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                            disabled={isLoggingOut}
                            onClick={() => logout()}
                            className="text-red-600 focus:text-red-600 cursor-pointer"
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            {isLoggingOut ? "Logging out..." : "Logout"}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

        </header>
    );
}