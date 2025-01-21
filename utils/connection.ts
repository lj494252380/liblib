import type { NodeType, Connection, DragConnection } from "../types"

export function drawConnections(
  ctx: CanvasRenderingContext2D,
  nodes: NodeType[],
  connections: Connection[],
  dragConnection: DragConnection | null,
) {
  // Draw existing connections
  connections.forEach((connection) => {
    const fromNode = nodes.find((n) => n.id === connection.fromNode)
    const toNode = nodes.find((n) => n.id === connection.toNode)
    if (!fromNode || !toNode) return

    const fromPoint = fromNode.outputPoints.find((p) => p.id === connection.fromPoint)
    const toPoint = toNode.inputPoints.find((p) => p.id === connection.toPoint)
    if (!fromPoint || !toPoint) return

    const startX = fromNode.position.x + fromPoint.position.x
    const startY = fromNode.position.y + fromPoint.position.y
    const endX = toNode.position.x + toPoint.position.x
    const endY = toNode.position.y + toPoint.position.y

    drawBezierConnection(ctx, startX, startY, endX, endY, connection.color)
  })

  // Draw drag connection
  if (dragConnection) {
    const fromNode = nodes.find((n) => n.id === dragConnection.fromNode)
    if (!fromNode) return

    const fromPoint = fromNode.outputPoints.find((p) => p.id === dragConnection.fromPoint)
    if (!fromPoint) return

    const startX = fromNode.position.x + fromPoint.position.x
    const startY = fromNode.position.y + fromPoint.position.y
    const endX = dragConnection.toPosition.x
    const endY = dragConnection.toPosition.y

    drawBezierConnection(ctx, startX, startY, endX, endY, "#fbbf24")
  }
}

function drawBezierConnection(
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  color: string,
) {
  const cp1x = startX + Math.abs(endX - startX) * 0.25
  const cp1y = startY
  const cp2x = endX - Math.abs(endX - startX) * 0.25
  const cp2y = endY

  ctx.beginPath()
  ctx.moveTo(startX, startY)
  ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY)

  ctx.strokeStyle = color
  ctx.lineWidth = 2
  ctx.stroke()

  // Draw connection points
  ctx.beginPath()
  ctx.arc(startX, startY, 4, 0, Math.PI * 2)
  ctx.fillStyle = color
  ctx.fill()

  ctx.beginPath()
  ctx.arc(endX, endY, 4, 0, Math.PI * 2)
  ctx.fillStyle = color
  ctx.fill()
}

