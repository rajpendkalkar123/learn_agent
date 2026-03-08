import { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import {
  Box,
  Database,
  Zap,
  Code,
  ExternalLink,
  Server,
} from "lucide-react";

const iconMap = {
  component: Box,
  service: Server,
  api: Zap,
  database: Database,
  function: Code,
  external: ExternalLink,
};

const colorMap = {
  component: "bg-blue-500/20 border-blue-500/50 text-blue-400",
  service: "bg-purple-500/20 border-purple-500/50 text-purple-400",
  api: "bg-green-500/20 border-green-500/50 text-green-400",
  database: "bg-orange-500/20 border-orange-500/50 text-orange-400",
  function: "bg-pink-500/20 border-pink-500/50 text-pink-400",
  external: "bg-slate-500/20 border-slate-500/50 text-slate-400",
};

function CustomNode({ data }: NodeProps) {
  const Icon = iconMap[data.type as keyof typeof iconMap] || Box;
  const colorClass = colorMap[data.type as keyof typeof colorMap] || colorMap.component;

  return (
    <div
      className={`px-4 py-3 rounded-lg border-2 ${colorClass} backdrop-blur-sm min-w-[150px] shadow-lg`}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4" />
        <div className="font-medium text-sm">{data.label}</div>
      </div>

      {data.module && (
        <div className="text-xs opacity-70 mt-1">{data.module}</div>
      )}

      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
}

export default memo(CustomNode);
