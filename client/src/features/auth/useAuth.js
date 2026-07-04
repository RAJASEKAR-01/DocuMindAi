import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { registerUser, loginUser, logoutUser, updateUserProfile } from "./authApi";
import { setCredentials, clearCredentials, selectCurrentUser, selectAccessToken } from "./authSlice";

export const useCurrentUser = () => useSelector(selectCurrentUser);
export const useAccessToken = () => useSelector(selectAccessToken);

export const useRegister = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: registerUser,
    onSuccess: (data) => {
      dispatch(setCredentials(data));
      toast.success(`Welcome to DocuMind AI, ${data.user.name.split(" ")[0]}!`);
      navigate("/dashboard");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Registration failed");
    },
  });
};

export const useLogin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      dispatch(setCredentials(data));
      toast.success(`Welcome back, ${data.user.name.split(" ")[0]}!`);
      navigate("/dashboard");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Invalid email or password");
    },
  });
};

export const useLogout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logoutUser,
    onSettled: () => {
      dispatch(clearCredentials());
      queryClient.clear();
      navigate("/login");
    },
  });
};

export const useUpdateProfile = () => {
  const dispatch = useDispatch();
  const accessToken = useSelector(selectAccessToken);

  return useMutation({
    mutationFn: updateUserProfile,
    onSuccess: (data) => {
      dispatch(setCredentials({ user: data.user, accessToken }));
      toast.success("Profile updated");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Could not update profile");
    },
  });
};
