import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/about')({
  component: About,
})

function About() {
  return (
    <div className="py-12 px-6 bg-gradient-to-r from-blue-400 to-purple-400 rounded-xl backdrop-blur-sm">
      <h2 className="text-3xl font-bold text-slate-50 mb-4">About</h2>
      <p className="text-slate-200 mb-6">
        TalkToDoc-AI is a web application that allows you to chat with your documents using AI.
        </p>
      <ul className="space-y-3">
        {[
          '...',
          '...',
          '...'
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
