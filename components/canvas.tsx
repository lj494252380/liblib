"use client"

import { useRef, useEffect, useState } from "react"
import { useNodeStore } from "../store/node-store"
import { Node } from "./node"
import { drawConnections } from "../utils/connection"
import { drawGrid } from "../utils/grid"
import { Button } from "@/components/ui/button"
import { Plus, Save, Upload, ZoomIn, ZoomOut } from "lucide-react"
import type { Position, NodeType } from "../types"
import { useToast } from "@/components/ui/use-toast"

export default function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [newNodeId, setNewNodeId] = useState<string | null>(null)
  const {
    nodes,
    connections,
    scale,
    position,
    addNode,
    removeNode,
    updateNodePosition,
    updateNodeInput,
    toggleNodeMinimize,
    addConnection,
    removeConnection,
    setScale,
    setPosition,
    loadState,
  } = useNodeStore()
  const { toast } = useToast()

  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState<Position>({ x: 0, y: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    const updateCanvasSize = () => {
      if (containerRef.current) {
        canvas.width = containerRef.current.clientWidth
        canvas.height = containerRef.current.clientHeight
      }
    }
    updateCanvasSize()
    window.addEventListener("resize", updateCanvasSize)

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.save()
      ctx.scale(scale, scale)
      ctx.translate(position.x, position.y)

      drawGrid(ctx, canvas.width / scale, canvas.height / scale)
      drawConnections(ctx, nodes, connections)

      ctx.restore()
      requestAnimationFrame(render)
    }
    render()

    return () => {
      window.removeEventListener("resize", updateCanvasSize)
    }
  }, [nodes, connections, scale, position])

  const handleAddNode = () => {
    const id = (nodes.length + 1).toString()
    const newNode: NodeType = {
      id,
      title: `Node ${id}`,
      position: { x: 100, y: 100 },
      inputs: [
        { id: "input1", type: "text", label: "Text Input", value: "" },
        { id: "input2", type: "number", label: "Number Input", value: 0 },
      ],
      inputPoints: [
        { id: "in1", type: "input", position: { x: 0, y: 20 } },
        { id: "in2", type: "input", position: { x: 0, y: 40 } },
      ],
      outputPoints: [{ id: "out1", type: "output", position: { x: 280, y: 30 } }],
      isMinimized: false,
    }
    addNode(newNode)
    setNewNodeId(id)
    // Clear the highlight after animation
    setTimeout(() => setNewNodeId(null), 2000)
  }

  const handleSave = () => {
    const state = useNodeStore.getState()
    const blob = new Blob([JSON.stringify(state)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "node-editor-state.json"
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleLoad = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".json"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (e) => {
        const state = JSON.parse(e.target?.result as string)
        loadState(state)
      }
      reader.readAsText(file)
    }
    input.click()
  }

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey) {
      e.preventDefault()
      const delta = e.deltaY > 0 ? 0.9 : 1.1
      setScale(Math.min(Math.max(0.1, scale * delta), 2))
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1) {
      // Middle mouse button
      setIsDragging(true)
      setDragStart({ x: e.clientX, y: e.clientY })
    }
  }

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const dx = (e.clientX - dragStart.x) / scale
      const dy = (e.clientY - dragStart.y) / scale
      setDragStart({ x: e.clientX, y: e.clientY })
      setPosition({
        x: position.x + dx,
        y: position.y + dy,
      })
    }
  }

  const handleCanvasMouseUp = () => {
    setIsDragging(false)
  }

  const handleConnectionStart = (fromNodeId: string, toNodeId: string) => {
    const fromNode = nodes.find((node) => node.id === fromNodeId)
    const toNode = nodes.find((node) => node.id === toNodeId)

    if (fromNode && toNode) {
      // Check if connection already exists
      const existingConnection = connections.find(
        (conn) =>
          (conn.fromNode === fromNodeId && conn.toNode === toNodeId) ||
          (conn.fromNode === toNodeId && conn.toNode === fromNodeId),
      )

      if (existingConnection) {
        toast({
          title: "Connection Error",
          description: "These nodes are already connected!",
          variant: "destructive",
        })
        return
      }

      const connection = {
        id: `${fromNodeId}-${toNodeId}`,
        fromNode: fromNodeId,
        toNode: toNodeId,
        fromPoint: fromNode.outputPoints[0].id,
        toPoint: toNode.inputPoints[0].id,
        color: "#fbbf24",
      }
      addConnection(connection)

      toast({
        title: "Success",
        description: `Connected ${fromNode.title} to ${toNode.title}`,
      })
    }
  }

  const handleConnectionRemove = (connectionId: string) => {
    removeConnection(connectionId)
  }

  return (
    <div className="relative w-full h-screen">
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <Button onClick={handleAddNode}>
          <Plus className="w-4 h-4 mr-2" />
          Add Node
        </Button>
        <Button onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" />
          Save
        </Button>
        <Button onClick={handleLoad}>
          <Upload className="w-4 h-4 mr-2" />
          Load
        </Button>
        <Button onClick={() => setScale(scale * 1.1)}>
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button onClick={() => setScale(scale * 0.9)}>
          <ZoomOut className="w-4 h-4" />
        </Button>
      </div>

      <div
        ref={containerRef}
        className="relative w-full h-full bg-gray-900 overflow-hidden"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
      >
        <canvas ref={canvasRef} className="absolute inset-0" />
        <div
          style={{
            transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
            transformOrigin: "0 0",
          }}
        >
          {nodes.map((node) => (
            <Node
              key={node.id}
              {...node}
              scale={scale}
              onDrag={updateNodePosition}
              onDragStart={() => {}}
              onInputChange={updateNodeInput}
              onMinimize={toggleNodeMinimize}
              onRemove={removeNode}
              onConnectionStart={handleConnectionStart}
              onConnectionRemove={handleConnectionRemove}
              allNodes={nodes}
              connections={connections}
              isNew={node.id === newNodeId}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

