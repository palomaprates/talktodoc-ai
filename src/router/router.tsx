import { createRouter } from '@tanstack/react-router'
import { routeTree } from '../routeTree.gen'
import { useContext } from 'react'
import { AuthContext } from '../auth/AuthContext'

export function useAppRouter() {
    const auth = useContext(AuthContext)
     const router = createRouter({ routeTree, context: {
      auth: {
        user: auth.user,
        isLoading: auth.isLoading,
      },
    }})
    return router
}