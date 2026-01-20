import { createFileRoute, Link } from '@tanstack/react-router'
import { supabase } from '../lib/supabase'
import { useEffect, useState } from 'react'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  const [session, setSession] = useState<any>(null)
  const [functionResponse, setFunctionResponse] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const callEdgeFunction = async () => {
    setIsLoading(true)
    setFunctionResponse(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        setFunctionResponse('Error: You must be logged in.')
        return
      }

      const response = await fetch('http://localhost:54321/functions/v1/talktodoc-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ name: session.user.email?.split('@')[0] }),
      })

      const data = await response.json()
      if (data.error) throw new Error(data.error)
      setFunctionResponse(data.message)
    } catch (err: any) {
      setFunctionResponse(`Error: ${err.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-8 text-center min-h-[60vh] flex flex-col items-center justify-center">
      {session ? (
        <div className="space-y-6 max-w-2xl mx-auto">
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 mb-6">
            Welcome, {session.user.email}!
          </h1>
          <p className="text-xl text-slate-400 leading-relaxed">
            You are successfully logged in. Try calling your first Edge Function to see how it identifies you!
          </p>
          
          <div className="pt-4 space-y-4">
            <button
              onClick={callEdgeFunction}
              disabled={isLoading}
              className={`bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition-all active:scale-95 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'Calling Function...' : 'Call Edge Function'}
            </button>

            {functionResponse && (
              <div className={`mt-6 p-4 rounded-lg border ${functionResponse.startsWith('Error') ? 'bg-red-900/20 border-red-500 text-red-200' : 'bg-emerald-900/20 border-emerald-500 text-emerald-200'}`}>
                {functionResponse}
              </div>
            )}
          </div>

          <div className="pt-12">
            <Link to="/about" className="text-blue-500 hover:underline text-lg">
              Learn more about TalkToDoc AI
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 mb-6 transition-all hover:scale-105">
            TalkToDoc AI
          </h1>
          <p className="text-xl text-slate-400 max-w-lg leading-relaxed mx-auto">
            Experience the future of document interaction. Sign in to start chatting with your medical documents.
          </p>
          <div className="pt-8">
            <Link 
              to="/login" 
              className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-full text-xl shadow-lg transition-transform hover:scale-105"
            >
              Sign In Now
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
