import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useContext, useEffect } from "react";
import { AuthContext } from "@/features/auth/AuthContext";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { user, isLoading } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && user) {
      navigate({ to: "/dashboard" });
    }
    if (!isLoading && !user) {
      navigate({ to: "/login" });
    }
  }, [user, isLoading, navigate]);

  // const handleLogout = async () => {
  //   await supabase.auth.signOut();
  // };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-500">Carregando…</div>
      </div>
    );
  }

  return null;

}