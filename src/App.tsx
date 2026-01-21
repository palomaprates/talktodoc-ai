import './App.css'
import { useAppRouter } from './router/router'
import { RouterProvider } from '@tanstack/react-router'

export default function App() {
  const router = useAppRouter();
  return (
        <RouterProvider router={router} />
  )
}