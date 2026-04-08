import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { AppSidebar } from '@/components/sidebarComponents/AppSidebar'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { Skeleton } from '@/components/ui/skeleton'
import { Dropzone } from '@/features/documents/components/Dropzone'
import { useKnowledgeDocuments } from '@/features/documents/hooks/useKnowledgeDocuments'
import { useContext, useMemo, useState } from 'react'
import { AuthContext } from '@/features/auth/AuthContext'
import { deleteDocument } from '@/features/documents/utils/deleteDocument'
import { ChatViewer } from '@/features/chat/components/ChatViewer'
import { toast } from '@/lib/toast'
import { supabase } from '@/lib/supabase'

export const Route = createFileRoute('/dashboard')({
  beforeLoad: ({ context }) => {
    const { user, isLoading } = context.auth

    if (isLoading) return

    if (!user) {
      throw redirect({ to: '/login' })
    }
  },
  component: DashboardRoute,
})

function DashboardRoute() {
  return <Dashboard />
}

export function Dashboard({ initialChatId }: { initialChatId?: string } = {}) {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const session = supabase.auth.getUser();
  console.log("session", session);
  const {
    documents,
    isLoading,
    refetch,
    updateDocumentTitle,
  } = useKnowledgeDocuments(user?.id);

  const handleDelete = async (documentId: string) => {
    try {
      await deleteDocument(documentId);
      if (selectedChatId === documentId) {
        setSelectedChatId(null);
      }
      await refetch();
      toast.success("Document removed.");
    } catch (err) {
      console.error(err);
      toast.error("Unable to remove the document.");
    }
  };

  const handleSelectChat = (chatId: string) => {
    const chat = documents.find((d) => d.id === chatId);
    if (chat) {
      setSelectedChatId(chat.id);
      navigate({ to: "/dashboard/$chatId", params: { chatId: chat.id } });
    }
  };

  const handleNewChat = () => {
    setSelectedChatId(null);
    navigate({ to: "/dashboard" });
  };

  const initialSelectedChatId = useMemo(() => {
    if (!initialChatId || isLoading) return null;
    const chat = documents.find((d) => d.id === initialChatId);
    return chat?.id ?? null;
  }, [initialChatId, isLoading, documents]);

  const activeChatId = selectedChatId ?? initialSelectedChatId;

  if (isLoading) {
    return (
      <SidebarProvider>
        <div className="flex w-full min-h-screen bg-violet-50">
          <aside className="hidden md:flex w-64 border-r border-slate-200 bg-white flex-col">
            <Skeleton className="h-16 m-4 w-32" />
            <div className="flex-1 p-4 space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full rounded-md" />
              <Skeleton className="h-10 w-full rounded-md" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          </aside>
          <main className="flex-1 p-4 sm:p-6 md:p-10 flex flex-col gap-6 md:gap-8 items-center justify-center">
            <div className="w-full flex items-center justify-between md:hidden">
              <SidebarTrigger className="text-slate-600" />
              <span className="text-sm font-semibold text-slate-700">TalkToDoc AI</span>
              <div className="w-7" />
            </div>
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-5 w-80" />
            <Skeleton className="h-[400px] w-full max-w-2xl rounded-2xl" />
          </main>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex w-full min-h-screen bg-violet-50">
        <AppSidebar 
          documents={documents} 
          onDelete={handleDelete}
          onSelectChat={handleSelectChat}
          activeChatId={activeChatId ?? undefined}
          onNewChat={handleNewChat}
          onRenameChat={updateDocumentTitle}
        />
        
        <main
          className={`flex-1 min-h-svh h-svh ${
            activeChatId ? "overflow-hidden" : "overflow-y-auto"
          }`}
        >
          {activeChatId ? (
            <ChatViewer 
              chatId={activeChatId} 
              fileId={documents.find((d) => d.id === activeChatId)?.files?.[0]?.id}
              documentTitle={documents.find((d) => d.id === activeChatId)?.title}
              onBack={handleNewChat}
            />
          ) : (
            <div className="p-4 sm:p-6 md:p-10 flex flex-col gap-6 md:gap-8 items-center justify-center min-h-svh">
              <div className="w-full flex items-center justify-between md:hidden">
                <SidebarTrigger className="text-slate-600" />
                <span className="text-sm font-semibold text-slate-700">TalkToDoc AI</span>
                <div className="w-7" />
              </div>
              <div className="text-center space-y-4">
                <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight select-none">
                  Welcome to TalkToDoc AI
                </h2>
                <p className="text-slate-500 max-w-md mx-auto select-none">
                  Upload your PDFs or text files to start interacting with your documents intelligently.
                </p>
              </div>
              
              <div className="w-full max-w-2xl">
                <Dropzone onUploadSuccess={async (chatId) => {
                  await refetch();
                  setSelectedChatId(chatId);
                }}/>
              </div>
            </div>
          )}
        </main>
      </div>
    </SidebarProvider>
  )
}
