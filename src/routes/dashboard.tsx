import { createFileRoute, redirect } from '@tanstack/react-router'
import { AppSidebar } from '@/components/sidebarComponents/AppSidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
import { Dropzone } from '@/components/dropzoneComponents/Dropzone'
import { useKnowledgeDocuments } from '@/hooks/useKnowledgeDocuments'
import { useContext } from 'react'
import { AuthContext } from '@/auth/AuthContext'
import { deleteDocument } from '@/components/utils/deleteDocument'

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
  const {
    documents,
    isLoading,
    refetch,
  } = useKnowledgeDocuments(user?.id);
    const handleDelete = async (documentId: string) => {
    try {
      await deleteDocument(documentId);
      await refetch();
    } catch (err) {
      console.error(err);
    }
  };
    if (isLoading) return <p>Loading...</p>;
  return (
<SidebarProvider>
<div className="min-w-screen px-4 md:px-8 flex gap-8 bg-violet-50 min-h-screen">
  <div className="w-64 flex flex-col">
    <AppSidebar documents={documents} onDelete={handleDelete}/>
  </div>
  <div className="flex-1 flex justify-around flex-col items-center">
    <Dropzone onUploadSuccess={refetch}/>
  </div>
</div>
</SidebarProvider>
  )
}