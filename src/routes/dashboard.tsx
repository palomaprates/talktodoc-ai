import { createFileRoute, redirect } from '@tanstack/react-router'
import { AppSidebar } from '@/components/sidebarComponents/AppSidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
import { Skeleton } from '@/components/ui/skeleton'
import { Dropzone } from '@/features/documents/components/Dropzone'
import { useKnowledgeDocuments } from '@/features/documents/hooks/useKnowledgeDocuments'
import { useContext, useState } from 'react'
import { AuthContext } from '@/features/auth/AuthContext'
import { deleteDocument } from '@/features/documents/utils/deleteDocument'
import { ChatViewer } from '@/features/chat/components/ChatViewer'
import { toast } from '@/lib/toast'

export const Route = createFileRoute('/dashboard')({
  beforeLoad: ({ context }) => {
    const { user, isLoading } = context.auth

    if (isLoading) return

    if (!user) {
      throw redirect({ to: '/login' })
    }
  },
  component: Dashboard,
})

function Dashboard() {
  const { user } = useContext(AuthContext);
  const [selectedFile, setSelectedFile] = useState<{ chatId: string; fileId: string } | null>(null);
  
  const {
    documents,
    isLoading,
    refetch,
  } = useKnowledgeDocuments(user?.id);

  const handleDelete = async (documentId: string) => {
    try {
      await deleteDocument(documentId);
      if (selectedFile?.chatId === documentId) {
        setSelectedFile(null);
      }
      await refetch();
      toast.success("Documento removido.");
    } catch (err) {
      console.error(err);
      toast.error("Não foi possível remover o documento.");
    }
  };

  const handleSelectChat = (chatId: string) => {
    const chat = documents.find((d) => d.id === chatId);
    if (chat && chat.files && chat.files.length > 0) {
      setSelectedFile({
        chatId: chat.id,
        fileId: chat.files[0].id,
      });
    }
  };

  if (isLoading) {
    return (
      <SidebarProvider>
        <div className="flex w-full min-h-screen bg-violet-50">
          <aside className="w-64 border-r border-slate-200 bg-white flex flex-col">
            <Skeleton className="h-16 m-4 w-32" />
            <div className="flex-1 p-4 space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full rounded-md" />
              <Skeleton className="h-10 w-full rounded-md" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          </aside>
          <main className="flex-1 p-6 md:p-10 flex flex-col gap-8 items-center justify-center">
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
          activeChatId={selectedFile?.chatId}
        />
        
        <main className="flex-1 p-6 md:p-10 flex flex-col gap-8 items-center justify-center">
          {selectedFile ? (
            <ChatViewer 
              chatId={selectedFile.chatId} 
              fileId={selectedFile.fileId}
              documentTitle={documents.find((d) => d.id === selectedFile.chatId)?.title}
              onBack={() => setSelectedFile(null)}
            />
          ) : (
            <>
              <div className="text-center space-y-4">
                <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight select-none">
                  Bem-vindo ao TalkToDoc AI
                </h2>
                <p className="text-slate-500 max-w-md mx-auto select-none">
                  Suba seus PDFs ou arquivos de texto para começar a interagir com seus documentos de forma inteligente.
                </p>
              </div>
              
              <div className="w-full max-w-2xl">
                <Dropzone onUploadSuccess={refetch}/>
              </div>
            </>
          )}
        </main>
      </div>
    </SidebarProvider>
  )
}