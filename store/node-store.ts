import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { NodeState, NodeType, Connection, Position } from "../types"

interface NodeStore extends NodeState {
  addNode: (node: NodeType) => void
  removeNode: (id: string) => void
  updateNodePosition: (id: string, position: Position) => void
  updateNodeInput: (nodeId: string, inputId: string, value: any) => void
  toggleNodeMinimize: (id: string) => void
  addConnection: (connection: Connection) => void
  removeConnection: (id: string) => void
  setScale: (scale: number) => void
  setPosition: (position: Position) => void
  loadState: (state: NodeState) => void
}

export const useNodeStore = create<NodeStore>()(
  persist(
    (set, get) => ({
      nodes: [],
      connections: [],
      scale: 1,
      position: { x: 0, y: 0 },

      addNode: (node) =>
        set((state) => ({
          nodes: [...state.nodes, node],
        })),

      removeNode: (id) =>
        set((state) => ({
          nodes: state.nodes.filter((node) => node.id !== id),
          connections: state.connections.filter((conn) => conn.fromNode !== id && conn.toNode !== id),
        })),

      updateNodePosition: (id, position) =>
        set((state) => ({
          nodes: state.nodes.map((node) => (node.id === id ? { ...node, position } : node)),
        })),

      updateNodeInput: (nodeId, inputId, value) =>
        set((state) => ({
          nodes: state.nodes.map((node) =>
            node.id === nodeId
              ? {
                  ...node,
                  inputs: node.inputs.map((input) => (input.id === inputId ? { ...input, value } : input)),
                }
              : node,
          ),
        })),

      toggleNodeMinimize: (id) =>
        set((state) => ({
          nodes: state.nodes.map((node) => (node.id === id ? { ...node, isMinimized: !node.isMinimized } : node)),
        })),

      addConnection: (connection) =>
        set((state) => ({
          connections: [...state.connections, connection],
        })),

      removeConnection: (id) =>
        set((state) => ({
          connections: state.connections.filter((conn) => conn.id !== id),
        })),

      setScale: (scale) => set({ scale }),
      setPosition: (position) => set({ position }),
      loadState: (state) => set(state),
    }),
    {
      name: "node-editor-storage",
    },
  ),
)

