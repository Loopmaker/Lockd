import { useState, useEffect } from 'react'
import useLocalStorage from '../../hooks/useLocalStorage'

function Notes() {
  const [saved, setSaved] = useLocalStorage<string>('lockd-notes', '')
  const [content, setContent] = useState(saved)
  const [status, setStatus] = useState<'idle' | 'saved'>('idle')

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSaved(content)
      setStatus('saved')

      const clear = setTimeout(() => setStatus('idle'), 1500)
      return () => clearTimeout(clear)
    }, 500)

    return () => clearTimeout(timeout)
  }, [content])

  return (
    <div className="flex flex-col gap-3 max-w-xl mx-auto py-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
          Notes
        </h2>
        <span
          className="text-xs transition-opacity duration-300"
          style={{
            color: 'var(--color-accent)',
            opacity: status === 'saved' ? 1 : 0,
          }}
        >
          Saved
        </span>
      </div>

      {/* Scratchpad */}
      <textarea
        value={content}
        onChange={(e) => {
          setContent(e.target.value)
          setStatus('idle')
        }}
        placeholder="Start typing..."
        className="w-full h-[60vh] p-4 rounded-lg text-sm resize-none outline-none leading-relaxed"
        style={{
          border: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-surface)',
          color: 'var(--color-text)',
          fontFamily: 'inherit',
        }}
      />

    </div>
  )
}

export default Notes