import { createFileRoute, redirect } from "@tanstack/react-router";
import { Dashboard } from "./dashboard";

export const Route = createFileRoute("/dashboard/$chatId")({
  beforeLoad: ({ context }) => {
    const { user, isLoading } = context.auth;

    if (isLoading) return;

    if (!user) {
      throw redirect({ to: "/login" });
    }
  },
  component: DashboardWithChat,
});

function DashboardWithChat() {
  const { chatId } = Route.useParams();
  return <Dashboard initialChatId={chatId} />;
}
