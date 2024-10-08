import { AxiosConfigPrivate } from "@/client/axios/AxiosConfig";
import { useUserContext } from "@/client/services/context/user/UseContext";

// ** Hook refreshes the token if it is expired and the user is authenticated ** //
const useRefreshToken = () => {
  const { setAuthenticatedUser } = useUserContext();
  const refreshToken = async () => {
    try {
      const response = await AxiosConfigPrivate.get("/refresh-token", {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      setAuthenticatedUser((user) => {
        return {
          ...user,
          refreshtoken: response.data.refreshtoken,
        };
      });
      const newAccessToken = response.data.refreshtoken;
      sessionStorage.setItem("refreshtoken", newAccessToken);
      AxiosConfigPrivate.defaults.headers.common["Authorization"] =
        `Bearer ${newAccessToken}`;
      return newAccessToken;
    } catch (error) {
      console.log(error);
      throw new Error("Unable to refresh token");
    }
  };

  return refreshToken;
};

export default useRefreshToken;
