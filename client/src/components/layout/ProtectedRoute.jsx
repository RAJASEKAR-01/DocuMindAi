import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectAccessToken, selectIsAuthResolved } from "../../features/auth/authSlice";

const ProtectedRoute = () => {
  const accessToken = useSelector(selectAccessToken);
  const isAuthResolved = useSelector(selectIsAuthResolved);
  const location = useLocation();

  if (!isAuthResolved) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-ink border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  if (!accessToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
