export type CanvasSelection =
  | { kind: "node"; id: string }
  | { kind: "edge"; from: string; to: string };
