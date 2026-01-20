import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/about')({
  component: About,
})

function About() {
  return (
    <div className="py-12 px-6 bg-slate-800/50 rounded-2xl border border-slate-700 backdrop-blur-sm">
      <h2 className="text-3xl font-bold text-white mb-4">About this Project</h2>
      <p className="text-slate-300 mb-6">
        This is a starter project set up with TanStack Router using file-based routing.
      </p>
      <ul className="space-y-3">
        {[
          'Full TypeScript Support',
          'File-based Routing Engine',
          'Tailwind CSS v4 (Alpha/Experimental Support)',
          'Vite for Ultra-fast Builds',
        ].map((feature) => (
          <li key={feature} className="flex items-center gap-3 text-slate-200">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            {feature}
          </li>
        ))}
      </ul>
    </div>
  )
}
