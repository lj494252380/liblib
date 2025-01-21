"use client"

import { useState, useRef, useEffect } from "react"
import { Minimize2, Maximize2, X, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from "@/components/ui/context-menu"
import type { NodeType, Position, ConnectionPoint, Connection } from "../types"

// ... other imports ...

interface NodeProps extends NodeType {
  scale: number
  onDrag: (id: string, position: Position) => void
  onDragStart: () => void
  onInputChange: (nodeId: string, inputId: string, value: any) => void
  onMinimize: (id: string) => void
  onRemove: (id: string) => void
  onConnectionStart: (fromNodeId: string, toNodeId: string) => void
  onConnectionRemove: (connectionId: string) => void
  allNodes: NodeType[]
  connections: Connection[]
  isNew?: boolean
}

export function Node({
  id,
  title,
  position,
  inputs,
  inputPoints,
  outputPoints,
  isMinimized,
  scale,
  onDrag,
  onDragStart,
  onInputChange,
  onMinimize,
  onRemove,
  onConnectionStart,
  onConnectionRemove,
  allNodes,
  connections,
  isNew,
}: NodeProps) {
  const nodeRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!nodeRef.current || e.button !== 0) return

    setIsDragging(true)
    onDragStart()

    const rect = nodeRef.current.getBoundingClientRect()
    setDragOffset({
      x: (e.clientX - rect.left) / scale,
      y: (e.clientY - rect.top) / scale,
    })
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return

      const x = e.clientX / scale - dragOffset.x
      const y = e.clientY / scale - dragOffset.y
      onDrag(id, { x, y })
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging, dragOffset, id, onDrag, scale])

  const nodeConnections = connections.filter((conn) => conn.fromNode === id || conn.toNode === id)

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div
          ref={nodeRef}
          className={`absolute min-w-[280px] bg-gray-800/90 rounded-lg shadow-lg border border-gray-700 select-none ${
            isNew ? "highlight-new-node" : ""
          }`}
          style={{
            left: position.x,
            top: position.y,
            zIndex: isDragging ? 100 : 1,
            transform: `scale(${scale})`,
            transformOrigin: "0 0",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center px-3 py-2 border-b border-gray-700 cursor-move"
            onMouseDown={handleMouseDown}
          >
            <div className="flex-1 text-sm text-gray-300">{title}</div>
            <div className="flex items-center gap-2">
              <div className="text-xs text-gray-500">#{id}</div>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onMinimize(id)}>
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onRemove(id)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          {!isMinimized && (
            <div className="p-3 space-y-2">
              {inputs.map((input) => (
                <div key={input.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{input.label}</span>
                    <input
                      type={input.type === "number" ? "number" : "text"}
                      value={input.value}
                      onChange={(e) => onInputChange(id, input.id, e.target.value)}
                      className="w-32 px-2 py-1 text-right bg-gray-700 rounded border border-gray-600 text-gray-200 text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Connection Points */}
          {inputPoints.map((point) => (
            <div
              key={point.id}
              className="absolute w-3 h-3 bg-yellow-400 rounded-full cursor-pointer"
              style={{
                left: point.position.x,
                top: point.position.y,
                transform: "translate(-50%, -50%)",
              }}
            />
          ))}
          {outputPoints.map((point) => (
            <div
              key={point.id}
              className="absolute w-3 h-3 bg-pink-400 rounded-full cursor-pointer"
              style={{
                left: point.position.x,
                top: point.position.y,
                transform: "translate(-50%, -50%)",
              }}
            />
          ))}
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem disabled>Connect to:</ContextMenuItem>
        {allNodes
          .filter((node) => node.id !== id)
          .map((node) => (
            <ContextMenuItem key={node.id} onClick={() => onConnectionStart(id, node.id)}>
              {node.title}
            </ContextMenuItem>
          ))}
        {nodeConnections.length > 0 && (
          <>
            <ContextMenuSeparator />
            <ContextMenuItem disabled>Remove connection:</ContextMenuItem>
            {nodeConnections.map((conn) => (
              <ContextMenuItem key={conn.id} onClick={() => onConnectionRemove(conn.id)}>
                <Trash2 className="w-4 h-4 mr-2" />
                {conn.fromNode === id
                  ? `To ${allNodes.find((n) => n.id === conn.toNode)?.title}`
                  : `From ${allNodes.find((n) => n.id === conn.fromNode)?.title}`}
              </ContextMenuItem>
            ))}
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  )
}

