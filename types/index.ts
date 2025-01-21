export interface Position {
  x: number
  y: number
}

export interface ConnectionPoint {
  id: string
  type: "input" | "output"
  position: Position
}

export interface NodeInput {
  id: string
  type: "number" | "text" | "select"
  label: string
  value: any
  options?: string[]
}

export interface NodeType {
  id: string
  title: string
  position: Position
  inputs: NodeInput[]
  inputPoints: ConnectionPoint[]
  outputPoints: ConnectionPoint[]
  isMinimized: boolean
}

export interface Connection {
  id: string
  fromNode: string
  fromPoint: string
  toNode: string
  toPoint: string
  color: string
}

export interface DragConnection {
  fromNode: string
  fromPoint: string
  toPosition: Position
}

export interface NodeState {
  nodes: NodeType[]
  connections: Connection[]
  dragConnection: DragConnection | null
  scale: number
  position: Position
}

