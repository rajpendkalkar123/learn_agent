"use client";

import { useCallback, useState } from "react";
import { useProjectStore } from "@/lib/store";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  Connection,
  addEdge,
  useNodesState,
  useEdgesState,
  NodeTypes,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";
import { GitBranch, X, Maximize2, Minimize2} from "lucide-react";
import CustomNode from "./CustomNode";

const nodeTypes: NodeTypes = {
  custom: CustomNode,
};

const edgeTypes = {
  calls: { type: "smoothstep", animated: true, style: { stroke: "#3b82f6" } },
  queries: { type: "smoothstep", style: { stroke: "#8b5cf6" } },
  depends_on: { type: "straight", style: { stroke: "#64748b", strokeDasharray: "5,5" } },
  returns_data: { type: "smoothstep", animated: true, style: { stroke: "#10b981" } },
};

export default function BottomPanel() {
  const { graphNodes, graphEdges, toggleGraph } = useProjectStore();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Convert store nodes to ReactFlow nodes
  const reactFlowNodes: Node[] = graphNodes.map((node) => ({
    id: node.id,
    type: "custom",
    position: node.position,
    data: {
      ...node.data,
      type: node.type,
    },
  }));

  // Convert store edges to ReactFlow edges
  const reactFlowEdges: Edge[] = graphEdges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    type: "smoothstep",
    animated: edge.type === "calls" || edge.type === "returns_data",
    label: edge.label,
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 20,
      height: 20,
      color: edge.type === "calls" ? "#3b82f6" : edge.type === "queries" ? "#8b5cf6" : "#64748b",
    },
    style: {
      stroke: edge.type === "calls" ? "#3b82f6" : edge.type === "queries" ? "#8b5cf6" : edge.type === "returns_data" ? "#10b981" : "#64748b",
      strokeWidth: 2,
    },
  }));

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  return (
    <div className={`bg-slate-900 border-t border-slate-800 ${isFullscreen ? "fixed inset-0 z-50" : "relative h-full"}`}>
      {/* Header */}
      <div className="h-10 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-blue-400" />
          <span className="text-sm text-white font-medium">
            Architecture Graph
          </span>
          <span className="text-xs text-slate-500">
            {reactFlowNodes.length} nodes • {reactFlowEdges.length} connections
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1 hover:bg-slate-800 rounded transition-colors"
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4 text-slate-400" />
            ) : (
              <Maximize2 className="w-4 h-4 text-slate-400" />
            )}
          </button>
          {!isFullscreen && (
            <button
              onClick={toggleGraph}
              className="p-1 hover:bg-slate-800 rounded transition-colors"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
          )}
        </div>
      </div>

      {/* Graph Area */}
      <div className="h-full bg-slate-950">
        {reactFlowNodes.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <GitBranch className="w-16 h-16 text-slate-700 mx-auto mb-4" />
              <p className="text-slate-500">No architecture graph yet</p>
              <p className="text-slate-600 text-sm mt-2">
                Generate modules to see the dependency graph
              </p>
            </div>
          </div>
        ) : (
          <div className="h-[calc(100%-2.5rem)] relative">
            <ReactFlow
              nodes={reactFlowNodes}
              edges={reactFlowEdges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={onNodeClick}
              nodeTypes={nodeTypes}
              fitView
              attributionPosition="bottom-left"
            >
              <Background color="#1e293b" gap={16} />
              <Controls className="bg-slate-800 border-slate-700" />
              <MiniMap
                className="bg-slate-800 border border-slate-700"
                nodeColor={(node) => {
                  const type = (node.data as any).type;
                  const colorMap: Record<string, string> = {
                    component: "#3b82f6",
                    service: "#8b5cf6",
                    api: "#10b981",
                    database: "#f59e0b",
                    function: "#ec4899",
                    external: "#64748b",
                  };
                  return colorMap[type] || "#64748b";
                }}
              />
            </ReactFlow>

            {/* Node Details Panel */}
            {selectedNode && (
              <div className="absolute top-4 right-4 w-80 bg-slate-900 border border-slate-700 rounded-lg p-4 shadow-xl">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-white font-medium">
                    {selectedNode.data.label}
                  </h3>
                  <button
                    onClick={() => setSelectedNode(null)}
                    className="p-1 hover:bg-slate-800 rounded"
                  >
                    <X className="w-4 h-4 text-slate-400" />
                  </button>
                </div>

                {selectedNode.data.description && (
                  <p className="text-slate-400 text-sm mb-3">
                    {selectedNode.data.description}
                  </p>
                )}

                {selectedNode.data.inputs && selectedNode.data.inputs.length > 0 && (
                  <div className="mb-3">
                    <div className="text-xs font-medium text-slate-500 mb-2">
                      Inputs:
                    </div>
                    <div className="space-y-1">
                      {selectedNode.data.inputs.map((input: any, idx: number) => (
                        <div
                          key={idx}
                          className="text-xs bg-slate-800/50 rounded px-2 py-1"
                        >
                          <span className="text-blue-400">{input.name}</span>:{" "}
                          <span className="text-slate-400">{input.type}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedNode.data.outputs && selectedNode.data.outputs.length > 0 && (
                  <div>
                    <div className="text-xs font-medium text-slate-500 mb-2">
                      Outputs:
                    </div>
                    <div className="space-y-1">
                      {selectedNode.data.outputs.map((output: any, idx: number) => (
                        <div
                          key={idx}
                          className="text-xs bg-slate-800/50 rounded px-2 py-1"
                        >
                          <span className="text-green-400">{output.name}</span>:{" "}
                          <span className="text-slate-400">{output.type}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
