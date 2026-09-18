export type {
  ArchitectureEdge,
  ArchitectureNodeType,
  DataStore,
  ExternalSystem,
  MessageSystem,
  Service,
  SystemDesign,
} from "@/lib/architecture/validation";

export interface ArchitectureGraphNode {
  id: string;
  type: "architecture";
  position: { x: number; y: number };
  data: {
    label: string;
    nodeType: string;
    technology?: string;
    description?: string;
  };
}

export interface ArchitectureGraphEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}
