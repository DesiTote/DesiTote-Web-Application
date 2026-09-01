import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  addToCartAPI,
  clearCartAPI,
  getCartAPI,
  removeCartItemAPI,
  updateCartQuantityAPI,
} from "@/services/customer/cart.api";
import { toast } from "sonner";
import { getCookie } from "@/utils/cookie";

// =========================
// 📦 GET CART
// =========================

export const useGetCart = () => {
  const hasSessionHint = getCookie("isLoggedIn") === "true";

  return useQuery({
    queryKey: ["cart"],
    queryFn: getCartAPI,
    //enabled: hasSessionHint,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });
};

// =========================
// ➕ ADD TO CART
// =========================

export const useAddToCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addToCartAPI,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },

    onError: () => {
      toast.error("Failed to add item to cart");
    },
  });
};

// =========================
// ✏️ UPDATE QUANTITY
// =========================

export const useUpdateCartQuantity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCartQuantityAPI,

    onMutate: async (variables) => {
      await queryClient.cancelQueries({
        queryKey: ["cart"],
      });

      const previousCart = queryClient.getQueryData(["cart"]);

      queryClient.setQueryData(["cart"], (oldData: any) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          items: oldData.items.map((item: any) =>
            item.productId === variables.productId
              ? {
                ...item,
                quantity: variables.quantity,
              }
              : item
          ),
        };
      });

      return { previousCart };
    },
    onError: (err:any, __, context) => {
      toast.error(err?.response?.data.message ||"Failed to add")
      queryClient.setQueryData(["cart"], context?.previousCart);
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["cart"],
      });
    },
  });
};

// =========================
// ❌ REMOVE PRODUCT
// =========================

export const useRemoveCartItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeCartItemAPI,

    onMutate: async (productId) => {
      await queryClient.cancelQueries({
        queryKey: ["cart"],
      });

      const previousCart = queryClient.getQueryData(["cart"]);

      console.log("prevCart",previousCart)

      queryClient.setQueryData(["cart"], (oldData: any) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          items: oldData.items.filter(
            (item: any) => item.productId !== productId
          ),
        };
      });

      return { previousCart };
    },
    onSuccess: () => {
      toast.success(
        "Item deleted successfully"
      );
    },

    onError: (_, __, context) => {
      toast.error(
        "Failed to delete cart item"
      );
      queryClient.setQueryData(["cart"], context?.previousCart);
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["cart"],
      });
    },
  });
};

// =========================
// 🗑️ CLEAR CART
// =========================

export const useClearCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: clearCartAPI,

    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: ["cart"],
      });

      const previousCart = queryClient.getQueryData(["cart"]);

      queryClient.setQueryData(["cart"], (oldData: any) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          items: [],
        };
      });

      return { previousCart };
    },

    onError: (_, __, context) => {
      queryClient.setQueryData(["cart"], context?.previousCart);
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["cart"],
      });
    },
  });
};



