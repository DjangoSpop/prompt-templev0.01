import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'

export interface OptimSession {
  id: string
  title: string
  pinned?: boolean
  createdAt: number
  updatedAt: number
  templateId?: string
  variables?: Record<string, unknown>
  bestPrompt?: string
  rubric?: {
    clarity: number
    specificity: number
    faithfulness: number
  }
  messages: Array<{
    id: string
    role: 'user' | 'model' | 'system'
    content: string
    meta?: {
      variant?: 'A' | 'B' | 'C'
      tokens?: number
      latencyMs?: number
    }
    createdAt: number
  }>
}

interface OptimizerState {
  sessions: Record<string, OptimSession>
  lastActiveId?: string
  createSession: (title: string, templateId?: string, variables?: Record<string, unknown>) => string
  renameSession: (id: string, title: string) => void
  pinSession: (id: string) => void
  removeSession: (id: string) => void
  setActiveSession: (id: string) => void
  addMessage: (sessionId: string, role: OptimSession['messages'][0]['role'], content: string, meta?: OptimSession['messages'][0]['meta']) => void
  acceptVariant: (sessionId: string, messageId: string, variant: 'A' | 'B' | 'C') => void
  updateBestPrompt: (sessionId: string, prompt: string) => void
  updateRubric: (sessionId: string, rubric: OptimSession['rubric']) => void
  attachTemplateContext: (sessionId: string, templateId: string, variables: Record<string, unknown>) => void
}

export const useOptimizerSessions = create<OptimizerState>()(
  persist(
    (set) => ({
      sessions: {},
      createSession: (title, templateId, variables) => {
        const id = uuidv4()
        const now = Date.now()
        set((state) => ({
          sessions: {
            ...state.sessions,
            [id]: {
              id,
              title,
              templateId,
              variables,
              messages: [],
              createdAt: now,
              updatedAt: now,
            },
          },
          lastActiveId: id,
        }))
        return id
      },
      renameSession: (id, title) =>
        set((state) => ({
          sessions: {
            ...state.sessions,
            [id]: {
              ...state.sessions[id],
              title,
              updatedAt: Date.now(),
            },
          },
        })),
      pinSession: (id) =>
        set((state) => ({
          sessions: {
            ...state.sessions,
            [id]: {
              ...state.sessions[id],
              pinned: !state.sessions[id].pinned,
              updatedAt: Date.now(),
            },
          },
        })),
      removeSession: (id) =>
        set((state) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { [id]: removed, ...sessions } = state.sessions
          return {
            sessions,
            lastActiveId: state.lastActiveId === id ? undefined : state.lastActiveId,
          }
        }),
      setActiveSession: (id) =>
        set({
          lastActiveId: id,
        }),
      addMessage: (sessionId, role, content, meta) =>
        set((state) => {
          const session = state.sessions[sessionId]
          if (!session) return state

          const now = Date.now()
          return {
            sessions: {
              ...state.sessions,
              [sessionId]: {
                ...session,
                messages: [
                  ...session.messages,
                  {
                    id: uuidv4(),
                    role,
                    content,
                    meta,
                    createdAt: now,
                  },
                ],
                updatedAt: now,
              },
            },
          }
        }),
      acceptVariant: (sessionId, messageId, selectedVariant) =>
        set((state) => {
          const session = state.sessions[sessionId]
          if (!session) return state

          const message = session.messages.find((m) => m.id === messageId && m.meta?.variant === selectedVariant)
          if (!message) return state

          return {
            sessions: {
              ...state.sessions,
              [sessionId]: {
                ...session,
                bestPrompt: message.content,
                updatedAt: Date.now(),
              },
            },
          }
        }),
      updateBestPrompt: (sessionId, prompt) =>
        set((state) => {
          const session = state.sessions[sessionId]
          if (!session) return state

          return {
            sessions: {
              ...state.sessions,
              [sessionId]: {
                ...session,
                bestPrompt: prompt,
                updatedAt: Date.now(),
              },
            },
          }
        }),
      updateRubric: (sessionId, rubric) =>
        set((state) => {
          const session = state.sessions[sessionId]
          if (!session) return state

          return {
            sessions: {
              ...state.sessions,
              [sessionId]: {
                ...session,
                rubric,
                updatedAt: Date.now(),
              },
            },
          }
        }),
      attachTemplateContext: (sessionId, templateId, variables) =>
        set((state) => {
          const session = state.sessions[sessionId]
          if (!session) return state

          return {
            sessions: {
              ...state.sessions,
              [sessionId]: {
                ...session,
                templateId,
                variables,
                updatedAt: Date.now(),
              },
            },
          }
        }),
    }),
    {
      name: 'optimizer-sessions',
      version: 1,
    }
  )
)
