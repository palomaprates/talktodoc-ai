import { createRouter } from '@tanstack/react-router'
import { routeTree } from '../routeTree.gen'
import { useContext } from 'react'
import { AuthContext } from '@/features/auth/AuthContext'

export function useAppRouter() {
    const auth = useContext(AuthContext)
     const router = createRouter({ routeTree, context: {
      auth: {
        user: auth.user,
        session: auth.session,
        isLoading: auth.isLoading,
      },
    }})
    return router
}