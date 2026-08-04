"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function LoginModal({ open, setOpen }: any) {
  const router = useRouter();

  const goToLogin = () => {
    setOpen(false);
    router.push("/login");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="text-center p-6"
        onClick={(e) => e.stopPropagation()}
        onPointerDownOutside={(e) => e.stopPropagation()}
      >
        <DialogHeader className="text-center">
          <DialogTitle className="text-lg font-semibold">
            Login Required
          </DialogTitle>
          <DialogDescription className="text-gray-500 text-sm mt-2">
            Please login to continue
          </DialogDescription>
        </DialogHeader>

        <Button
          className="cursor-pointer bg-amber-500 mt-4 w-full"
          onClick={(e) => {
            e.stopPropagation();
            goToLogin();
          }}
        >
          Go to Login
        </Button>
      </DialogContent>
    </Dialog>
  );
}