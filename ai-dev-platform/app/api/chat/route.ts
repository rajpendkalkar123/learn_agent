import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { inMemoryStore } from "@/lib/mock-data";
import { getProject } from "@/lib/dynamodb";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { projectId, question, context } = await request.json();
    const userId = (session.user as any).id;
    
    // Get project for context
    const project = await getProject(projectId);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const conversationKey = `${userId}-${projectId}`;
    const conversation = inMemoryStore.conversations.get(conversationKey) || {
      id: conversationKey,
      projectId,
      userId,
      messages: [],
      createdAt: new Date().toISOString(),
    };

    // Add user message
    conversation.messages.push({
      id: `msg-${Date.now()}`,
      role: "user",
      content: question,
      timestamp: new Date().toISOString(),
      context,
    });

    // Generate AI response based on project context
    const knowledgeLevel = (session.user as any).knowledgeLevel || "intermediate";
    const aiResponse = generateContextualResponse(
      question,
      project,
      context,
      knowledgeLevel,
      conversation.messages
    );

    conversation.messages.push({
      id: `msg-${Date.now() + 1}`,
      role: "assistant",
      content: aiResponse,
      timestamp: new Date().toISOString(),
      relatedModules: extractRelatedModules(question, project),
    });

    conversation.lastMessageAt = new Date().toISOString();
    inMemoryStore.conversations.set(conversationKey, conversation);

    return NextResponse.json({
      message: conversation.messages[conversation.messages.length - 1],
      conversation,
    });
  } catch (error: any) {
    console.error("Error in chat:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process message" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const userId = (session.user as any).id;
    
    if (!projectId) {
      return NextResponse.json({ error: "Project ID required" }, { status: 400 });
    }

    const conversationKey = `${userId}-${projectId}`;
    const conversation = inMemoryStore.conversations.get(conversationKey) || {
      id: conversationKey,
      projectId,
      userId,
      messages: [],
      createdAt: new Date().toISOString(),
      lastMessageAt: null,
    };

    return NextResponse.json(conversation);
  } catch (error: any) {
    console.error("Error fetching conversation:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch conversation" },
      { status: 500 }
    );
  }
}

function generateContextualResponse(
  question: string,
  project: any,
  context: any,
  knowledgeLevel: string,
  history: any[]
): string {
  const questionLower = question.toLowerCase();
  
  // Architecture questions
  if (questionLower.includes("architecture") || questionLower.includes("structure")) {
    if (knowledgeLevel === "beginner") {
      return `Great question! The architecture of ${project.name} is organized into different layers:

${project.architecture.layers?.map((l: any) => `• **${l.name}**: ${l.description}`).join('\n')}

Think of it like building a house - each layer has its own purpose, and they work together to create the complete application. The frontend layer is what users see (like the walls and paint), the backend handles the logic (like the plumbing and electrical), and the database stores information (like the foundation).

Would you like me to explain any specific layer in more detail?`;
    } else {
      return `The ${project.name} follows a layered architecture pattern with clear separation of concerns:

${project.architecture.layers?.map((l: any) => `**${l.name}** (${l.type}): ${l.description}`).join('\n\n')}

This architecture enables:
- Independent scaling of layers
- Clear dependency management
- Easier testing and maintenance
- Technology flexibility per layer

The modules are distributed across these layers with well-defined interfaces.`;
    }
  }
  
  // Module questions
  if (questionLower.includes("module") || questionLower.includes("component")) {
    const modules = project.architecture.modules || [];
    if (modules.length === 0) {
      return "This project doesn't have modules defined yet. Would you like help breaking down the architecture into modules?";
    }
    
    return `The project has ${modules.length} modules:

${modules.slice(0, 5).map((m: any) => `• **${m.name}**: ${m.description}`).join('\n')}

Each module has specific responsibilities and dependencies. Which module would you like to learn more about?`;
  }
  
  // Technology questions
  if (questionLower.includes("technology") || questionLower.includes("tech stack") || questionLower.includes("tools")) {
    const techStack = project.architecture.techStack;
    return `${project.name} uses the following technologies:

**Frontend**: ${techStack.frontend?.join(', ') || 'Not specified'}
**Backend**: ${techStack.backend?.join(', ') || 'Not specified'}
**Database**: ${techStack.database?.join(', ') || 'Not specified'}
**External Services**: ${techStack.external?.join(', ') || 'Not specified'}

${knowledgeLevel === "beginner" ? 
  "These technologies work together to create a modern, scalable application. Each one serves a specific purpose in the stack." :
  "This stack provides a robust foundation for building scalable, maintainable applications with modern development practices."
}`;
  }
  
  // How to start questions
  if (questionLower.includes("how to start") || questionLower.includes("getting started") || questionLower.includes("begin")) {
    return `To get started with ${project.name}:

1. **Understand the Architecture**: Review the overall system design and how components interact
2. **Start Learning**: Click the "Start Learning Path" button to get a personalized, step-by-step guide
3. **Build  Modules**: Begin with the foundational modules that have no dependencies
4. **Test as You Go**: Make sure each module works before moving to the next

The learning path adapts to your ${knowledgeLevel} level and guides you through the entire development process. Ready to start?`;
  }
  
  // Dependencies questions
  if (questionLower.includes("depend") || questionLower.includes("connect")) {
    const modules = project.architecture.modules || [];
    const withDeps = modules.filter((m: any) => m.dependencies?.length > 0);
    
    if (withDeps.length === 0) {
      return "Most modules in this project are independent, which makes development easier!";
    }
    
    return `Here's how the modules connect:

${withDeps.slice(0, 3).map((m: any) => 
  `• **${m.name}** depends on: ${m.dependencies.join(', ')}`
).join('\n')}

Understanding these dependencies helps you build modules in the right order. Start with modules that have no dependencies, then work your way up.`;
  }

  // Default response
  return `That's a great question about ${project.name}! 

Based on the current context, I can help you with:
- Understanding the architecture and how components interact
- Learning about specific modules and their purposes
- Explaining the technology stack and why each tool was chosen
- Providing step-by-step guidance for building features
- Answering questions about dependencies and data flow

${context?.currentModule ? `I see you're currently working on the **${context.currentModule}** module. ` : ''}

What would you like to know more about?`;
}

function extractRelatedModules(question: string, project: any): string[] {
  const modules = project.architecture.modules || [];
  const relatedModules: string[] = [];
  
  modules.forEach((module: any) => {
    if (question.toLowerCase().includes(module.name.toLowerCase())) {
      relatedModules.push(module.id);
    }
  });
  
  return relatedModules;
}
