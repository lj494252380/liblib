export function drawGrid(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const gridSize = 20
  ctx.strokeStyle = "#374151"
  ctx.lineWidth = 0.5

  for (let x = 0; x <= width; x += gridSize) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height)
    ctx.stroke()
  }

  for (let y = 0; y <= height; y += gridSize) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
    ctx.stroke()
  }
}

