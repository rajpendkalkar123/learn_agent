import { NextRequest, NextResponse } from "next/server";
import { getProject } from "@/lib/dynamodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { projectId, moduleId, changes } = await request.json();
    
    const project = await getProject(projectId);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const module = project.architecture.modules.find((m: any) => m.id === moduleId);
    if (!module) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 });
    }

    // Analyze impact
    const impact = analyzeImpact(module, project.architecture.modules, changes);

    return NextResponse.json(impact);
  } catch (error: any) {
    console.error("Error analyzing impact:", error);
    return NextResponse.json(
      { error: error.message || "Failed to analyze impact" },
      { status: 500 }
    );
  }
}

function analyzeImpact(targetModule: any, allModules: any[], changes: any) {
  const directImpacts: any[] = [];
  const indirectImpacts: any[] = [];
  const breakingChanges: any[] = [];

  // Find modules that depend on this module
  allModules.forEach((module) => {
    if (module.dependencies.includes(targetModule.id)) {
      directImpacts.push({
        moduleId: module.id,
        moduleName: module.name,
        impactType: "dependency",
        description: `${module.name} directly depends on ${targetModule.name}`,
        severity: "high",
        affectedFeatures: [`Integration with ${targetModule.name}`],
      });

      // Find modules that depend on the dependent modules (indirect)
      allModules.forEach((indirectModule) => {
        if (
          indirectModule.dependencies.includes(module.id) &&
          indirectModule.id !== targetModule.id
        ) {
          indirectImpacts.push({
            moduleId: indirectModule.id,
            moduleName: indirectModule.name,
            impactType: "transitive",
            description: `${indirectModule.name} indirectly affected through ${module.name}`,
            severity: "medium",
          });
        }
      });
    }
  });

  // Detect potential breaking changes
  if (changes?.type === "interface" || changes?.type === "api") {
    breakingChanges.push({
      changeType: changes.type,
      description: `Modifying ${changes.type} may break dependent modules`,
      affectedModules: directImpacts.map((impact) => impact.moduleId),
      migrationRequired: true,
      estimatedEffort: directImpacts.length > 2 ? "high" : "medium",
    });
  }

  // Calculate risk level
  let riskLevel: "low" | "medium" | "high" | "critical" = "low";
  if (breakingChanges.length > 0 && directImpacts.length > 3) {
    riskLevel = "critical";
  } else if (breakingChanges.length > 0 || directImpacts.length > 2) {
    riskLevel = "high";
  } else if (directImpacts.length > 0 || indirectImpacts.length > 0) {
    riskLevel = "medium";
  }

  return {
    targetModule: {
      id: targetModule.id,
      name: targetModule.name,
    },
    directImpacts,
    indirectImpacts,
    breakingChanges,
    totalAffected: directImpacts.length + indirectImpacts.length,
    riskLevel,
    recommendation:
      riskLevel === "critical"
        ? "⚠️ Critical changes detected. Thoroughly test all dependent modules and plan migration carefully."
        : riskLevel === "high"
        ? "⚠️ High-impact changes. Test dependent modules and update documentation."
        : riskLevel === "medium"
        ? "ℹ️ Moderate impact. Review dependent modules for compatibility."
        : "✅ Low impact detected. Safe to proceed with normal testing.",
    suggestedActions: generateSuggestedActions(
      directImpacts.length,
      breakingChanges.length,
      riskLevel
    ),
  };
}

function generateSuggestedActions(
  directImpactsCount: number,
  breakingChangesCount: number,
  riskLevel: string
): string[] {
  const actions: string[] = [];

  if (riskLevel === "critical" || riskLevel === "high") {
    actions.push("Create migration guide for dependent modules");
    actions.push("Update API/interface documentation");
    actions.push("Notify team members working on dependent modules");
    actions.push("Schedule integration testing session");
  }

  if (directImpactsCount > 0) {
    actions.push(`Review ${directImpactsCount} directly dependent module(s)`);
    actions.push("Update integration tests");
  }

  if (breakingChangesCount > 0) {
    actions.push("Consider versioning strategy");
    actions.push("Implement backward compatibility if possible");
  }

  if (actions.length === 0) {
    actions.push("Proceed with regular unit testing");
    actions.push("Update module documentation");
  }

  return actions;
}
