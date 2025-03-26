"use client"

import type React from "react"

// Simplified version of the shadcn/ui toast hook
import { useState, useCallback } from "react"

export interface Toast {
  id: string
  title?: string
  description?: string
  action?: React.ReactNode
  variant?: "default" | "destructive"
}

export interface ToastActionElement {
  altText: string
  onClick: () => void
  children: React.ReactNode
}

const TOAST_LIMIT = 5
const TOAST_REMOVE_DELAY = 5000

export type ToasterToast = Toast & {
  id: string
  title?: string
  description?: string
  action?: React.ReactNode
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

type ActionType = typeof actionTypes

type Action =
  | {
      type: ActionType["ADD_TOAST"]
      toast: ToasterToast
    }
  | {
      type: ActionType["UPDATE_TOAST"]
      toast: Partial<ToasterToast>
    }
  | {
      type: ActionType["DISMISS_TOAST"]
      toastId?: string
    }
  | {
      type: ActionType["REMOVE_TOAST"]
      toastId?: string
    }

interface State {
  toasts: ToasterToast[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case actionTypes.ADD_TOAST:
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case actionTypes.UPDATE_TOAST:
      return {
        ...state,
        toasts: state.toasts.map((t) => (t.id === action.toast.id ? { ...t, ...action.toast } : t)),
      }

    case actionTypes.DISMISS_TOAST: {
      const { toastId } = action

      if (toastId) {
        return {
          ...state,
          toasts: state.toasts.filter((t) => t.id !== toastId),
        }
      }
      return {
        ...state,
        toasts: [],
      }
    }
    case actionTypes.REMOVE_TOAST: {
      const { toastId } = action

      if (toastId) {
        return {
          ...state,
          toasts: state.toasts.filter((t) => t.id !== toastId),
        }
      }
      return {
        ...state,
        toasts: [],
      }
    }
    default:
      return state
  }
}

export function useToast() {
  const [state, setState] = useState<State>({ toasts: [] })

  const dismiss = useCallback((toastId?: string) => {
    setState((prevState) => reducer(prevState, { type: actionTypes.DISMISS_TOAST, toastId }))
  }, [])

  const toast = useCallback(({ ...props }: Omit<ToasterToast, "id">) => {
    const id = genId()

    const update = (props: ToasterToast) =>
      setState((prevState) => reducer(prevState, { type: actionTypes.UPDATE_TOAST, toast: { ...props, id } }))

    const dismiss = () => setState((prevState) => reducer(prevState, { type: actionTypes.DISMISS_TOAST, toastId: id }))

    setState((prevState) =>
      reducer(prevState, {
        type: actionTypes.ADD_TOAST,
        toast: {
          ...props,
          id,
        },
      }),
    )

    return {
      id,
      dismiss,
      update,
    }
  }, [])

  return {
    toast,
    dismiss,
    toasts: state.toasts,
  }
}

