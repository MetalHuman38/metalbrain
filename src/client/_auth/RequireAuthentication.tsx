import { useUserContext } from "../services/context/user/UseContext";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import Loader from "../components/shared/Loader";

const RequireAuthentication = () => {
  const { isUserAuthenticated, isUserLoading } = useUserContext();
  const location = useLocation();

  console.log("isUserAuthenticated:", isUserAuthenticated);

  if (isUserLoading) {
    return <Loader />;
  }

  if (!isUserAuthenticated) {
    return (
      <Navigate to="/sign-in" state={{ from: location.pathname }} replace />
    );
  }

  return <Outlet />;
};

export default RequireAuthentication;
