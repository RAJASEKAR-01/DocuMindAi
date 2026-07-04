import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Toaster } from "react-hot-toast";
import AppRoutes from "./routes/AppRoutes";
import { setCredentials, setAccessToken, authResolved } from "./features/auth/authSlice";
import { refreshSession, fetchCurrentUser } from "./features/auth/authApi";

const App = () => {
  const dispatch = useDispatch();

  // On app load, silently try to restore a session from the httpOnly refresh cookie:
  // 1) exchange the refresh cookie for a fresh access token
  // 2) use that access token to fetch the current user
  // If either step fails (no cookie / expired), just mark auth as resolved (logged out).
  useEffect(() => {
    const bootstrapSession = async () => {
      try {
        const { accessToken } = await refreshSession();
        dispatch(setAccessToken(accessToken));

        const { user } = await fetchCurrentUser();
        dispatch(setCredentials({ user, accessToken }));
      } catch (error) {
        dispatch(authResolved());
      }
    };
    bootstrapSession();
  }, [dispatch]);

  return (
    <>
      <Toaster position="top-right" toastOptions={{ style: { fontWeight: 500 } }} />
      <AppRoutes />
    </>
  );
};

export default App;
