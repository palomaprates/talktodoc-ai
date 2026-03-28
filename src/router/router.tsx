import { createRouter } from '@tanstack/react-router'
import { routeTree } from '../routeTree.gen'
import { useContext, useEffect, useMemo } from 'react'
import { AuthContext } from '@/features/auth/AuthContext'

export function useAppRouter() {
    const auth = useContext(AuthContext)
    const router = useMemo(() => {
      return createRouter({
        routeTree,
        context: {
          auth: {
            user: null,
            session: null,
            isLoading: true,
          },
        },
      })
    }, [])

    useEffect(() => {
      router.update({
        context: {
          auth: {
            user: auth.user,
            session: auth.session,
            isLoading: auth.isLoading,
          },
        },
      })
    }, [auth.user, auth.session, auth.isLoading, router])

    return router
}
