import { axiosInstance } from "@/lib/axios";
import { useAuthStore } from "@/stores/useAuthStore";
import { useChatStore } from "@/stores/useChatStore";
import { useAuth } from "@clerk/clerk-react";
import { Loader } from "lucide-react";
import { useEffect, useState } from "react";

function AuthProvider({ children }: { children: React.ReactNode }) {
  const { getToken, userId } = useAuth();
  const { checkAdminStatus } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const { initSocket, disconnectSocket } = useChatStore();

  const updateApiToken = (token: string | null) => {
    if (token)
      axiosInstance.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${token}`;
    else delete axiosInstance.defaults.headers.common["Authorization"];
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = await getToken();
        updateApiToken(token);
        if (token) {
          await checkAdminStatus();
          ///init socket
          if (userId) initSocket(userId);
        }
      } catch (error: any) {
        updateApiToken(null);
        console.log("Error in AuthProvider", error);
      } finally {
        setLoading(false);
      }
    };
    initAuth();

    //clean up

    return () => disconnectSocket();
  }, [getToken, userId, checkAdminStatus, initSocket, disconnectSocket]);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader className="size-8 text-emerald-500 animate-spin " />
      </div>
    );
  }
  return <div>{children}</div>;
}

export default AuthProvider;
