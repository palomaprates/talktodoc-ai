import { createFileRoute, redirect } from '@tanstack/react-router'

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
  return <div>
    <h1>Dashboard under construction.</h1>
  </div>
}