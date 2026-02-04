import { createFileRoute, redirect } from '@tanstack/react-router'
import { AppSidebar } from '@/components/sidebarComponents/AppSidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
import { Dropzone } from '@/components/dropzoneComponents/Dropzone'
import { useKnowledgeDocuments } from '@/hooks/useKnowledgeDocuments'
import { useContext, useState } from 'react'
import { AuthContext } from '@/auth/AuthContext'
import { deleteDocument } from '@/components/utils/deleteDocument'
import { ChatViewer } from '@/components/chatComponents/ChatViewer'

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
    } catch (err) {
      console.error(err);
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

  if (isLoading) return <p>Loading...</p>;

  return (
    <SidebarProvider>
      <div className="flex w-full bg-violet-50 min-h-screen">
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
              onBack={() => setSelectedFile(null)}
            />
          ) : (
            <>
              <div className="text-center space-y-4">
                <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                  Bem-vindo ao TalkToDoc AI
                </h2>
                <p className="text-slate-500 max-w-md mx-auto">
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