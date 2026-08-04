import { useMutation, useQuery } from "@tanstack/react-query";
import { loginUser, registerUser, sendOtp, verifyOtp, getMe, logOutUser, forgotPasswordService, changePasswordService } from "@/services/auth.api";
import { ForgotPasswordPayload } from "@/types/auth.types";
import { getCookie } from "@/utils/cookie";

export const useRegister = () => {
  return useMutation({
    mutationFn: registerUser,
  });
};

export const useLogin = () => {
  return useMutation({
    mutationFn: loginUser
  })
}

export const useLogOut = () => {
  return useMutation({
    mutationFn: logOutUser
  })
}
// 🔹 Send OTP Hook
export const useSendOtp = () => {
  return useMutation({
    mutationFn: sendOtp,
  });
};

// 🔹 Verify OTP Hook
export const useVerifyOtp = () => {
  return useMutation({
    mutationFn: verifyOtp,
  });
};

// Fetch user

export const useMe = () => {
  const hasSessionHint = getCookie("isLoggedIn") === "true";
  //cache logic 
  return useQuery({
    queryKey: ["me"],
    queryFn: getMe,
    enabled:hasSessionHint,
    retry: false,
    refetchOnWindowFocus: false,
  })
}

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (payload: ForgotPasswordPayload) => forgotPasswordService(payload),
  });
};

// hooks/customer/useAuth.ts
export const useChangePassword = () => {
  return useMutation({
    mutationFn: (payload: { currentPassword: string; password: string }) =>
      changePasswordService(payload)
  });
};