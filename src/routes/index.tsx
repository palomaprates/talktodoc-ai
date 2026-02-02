import { createFileRoute, Link } from '@tanstack/react-router'
import { supabase } from '../lib/supabase'
import { useContext, useEffect } from 'react'
import { AuthContext } from '../auth/AuthContext'
import { useNavigate } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  const { user, isLoading } = useContext(AuthContext);
  const navigate = useNavigate();
useEffect(() => {
  if (!isLoading && user) {
    navigate({ to: "/dashboard" });
    return;
  }
  const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
    if (session) {
      navigate({ to: "/dashboard" });
    }
  });
  return () => {
    listener.subscription.unsubscribe();
  };
}, [user, isLoading, navigate]);

const handleLogout = async () => {
  await supabase.auth.signOut();
}

  return (
    <div className="p-8 text-center w-full min-h-[calc(100vh-56px)] flex flex-col items-center justify-center">
      {user ? (
        <div className="space-y-6 max-w-2xl mx-auto">
          <div className="pt-12 flex flex-col items-center space-y-4">
            <Link to="/dashboard" className="text-blue-500 hover:underline text-lg">
              Dashboard
            </Link>
            <button 
              onClick={handleLogout}
              className="mt-4 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-6 transition-all hover:scale-105">
            TalkToDoc AI
          </h1>
          <div className="pt-8">
            <Link 
              to="/login" 
              className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-full text-xl shadow-lg transition-transform hover:scale-105"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

