import { NextRequest, NextResponse } from "next/server";
import { getProject, getModulesByProject } from "@/lib/dynamodb";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { projectId, query } = await request.json();
    
    if (!projectId || !query) {
      return NextResponse.json(
        { error: "Project ID and query are required" },
        { status: 400 }
      );
    }

    const project = await getProject(projectId);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const modules = await getModulesByProject(projectId);
    
    // Perform semantic search
    const results = performSemanticSearch(query, project, modules);

    return NextResponse.json({
      query: query,
      results: results,
      totalResults: results.length,
    });
  } catch (error: any) {
    console.error("Error in search:", error);
    return NextResponse.json(
      { error: error.message || "Search failed" },
      { status: 500 }
    );
  }
}

function performSemanticSearch(
  query: string,
  project: any,
  modules: any[]
): any[] {
  const results: any[] = [];
  const queryLower = query.toLowerCase();
  const queryTerms = queryLower.split(/\s+/).filter((term) => term.length > 2);

  // Search in project name and idea
  if (
    project.name.toLowerCase().includes(queryLower) ||
    project.idea.toLowerCase().includes(queryLower)
  ) {
    results.push({
      type: "project",
      id: project.id,
      title: project.name,
      description: project.idea,
      relevanceScore: calculateRelevance(queryTerms, [
        project.name,
        project.idea,
      ]),
      highlights: extractHighlights(query, project.idea),
    });
  }

  // Search in modules
  modules.forEach((module) => {
    const searchableText = [
      module.name,
      module.description,
      module.type,
      module.layer,
    ];

    const relevanceScore = calculateRelevance(queryTerms, searchableText);

    if (relevanceScore > 0) {
      results.push({
        type: "module",
        id: module.id,
        moduleId: module.id,
        title: module.name,
        description: module.description,
        layer: module.layer,
        moduleType: module.type,
        relevanceScore: relevanceScore,
        highlights: extractHighlights(query, module.description),
        dependencies: module.dependencies,
      });
    }
  });

  // Search in architecture layers
  project.architecture.layers?.forEach((layer: any) => {
    const searchableText = [layer.name, layer.description, layer.type];
    const relevanceScore = calculateRelevance(queryTerms, searchableText);

    if (relevanceScore > 0) {
      results.push({
        type: "layer",
        id: layer.id,
        title: layer.name,
        description: layer.description,
        layerType: layer.type,
        relevanceScore: relevanceScore,
        highlights: extractHighlights(query, layer.description),
      });
    }
  });

  // Search in tech stack
  const techStack = project.architecture.techStack;
  const allTech = [
    ...(techStack.frontend || []),
    ...(techStack.backend || []),
    ...(techStack.database || []),
    ...(techStack.external || []),
  ];

  allTech.forEach((tech: string) => {
    if (tech.toLowerCase().includes(queryLower)) {
      results.push({
        type: "technology",
        id: tech.toLowerCase().replace(/\s+/g, "-"),
        title: tech,
        description: `Technology used in the project`,
        relevanceScore: queryLower === tech.toLowerCase() ? 10 : 5,
      });
    }
  });

  // Sort by relevance score (highest first)
  results.sort((a, b) => b.relevanceScore - a.relevanceScore);

  return results;
}

function calculateRelevance(queryTerms: string[], searchableTexts: string[]): number {
  let score = 0;
  const combinedText = searchableTexts.join(" ").toLowerCase();

  queryTerms.forEach((term) => {
    if (combinedText.includes(term)) {
      // Exact match in any field
      score += 2;
      
      // Bonus for word boundary match
      const regex = new RegExp(`\\b${term}\\b`, "i");
      if (regex.test(combinedText)) {
        score += 3;
      }
    }
  });

  // Bonus if all query terms are present
  const allTermsPresent = queryTerms.every((term) =>
    combinedText.includes(term)
  );
  if (allTermsPresent && queryTerms.length > 1) {
    score += 5;
  }

  return score;
}

function extractHighlights(query: string, text: string): string[] {
  const highlights: string[] = [];
  const queryLower = query.toLowerCase();
  const textLower = text.toLowerCase();
  
  // Find the position of the query in the text
  const index = textLower.indexOf(queryLower);
  
  if (index !== -1) {
    // Extract context around the match
    const start = Math.max(0, index - 40);
    const end = Math.min(text.length, index + queryLower.length + 40);
    let highlight = text.substring(start, end);
    
    if (start > 0) highlight = "..." + highlight;
    if (end < text.length) highlight = highlight + "...";
    
    highlights.push(highlight);
  } else {
    // Extract first sentence or first 100 characters
    const firstSentence = text.split(/[.!?]/)[0];
    highlights.push(
      firstSentence.length > 100
        ? firstSentence.substring(0, 100) + "..."
        : firstSentence
    );
  }
  
  return highlights;
}
