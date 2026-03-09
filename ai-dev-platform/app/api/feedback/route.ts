import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { inMemoryStore } from "@/lib/mock-data";

export interface Feedback {
  id: string;
  userId: string;
  userName: string;
  projectId?: string;
  moduleId?: string;
  conversationId?: string;
  type: "thumbs_up" | "thumbs_down" | "suggestion" | "bug_report";
  category: "explanation" | "code_generation" | "architecture" | "learning_path" | "ui" | "other";
  rating?: number; // 1-5
  comment?: string;
  context?: any;
  createdAt: string;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { projectId, moduleId, conversationId, type, category, rating, comment, context } =
      await request.json();

    if (!type || !category) {
      return NextResponse.json(
        { error: "Type and category are required" },
        { status: 400 }
      );
    }

    const feedback: Feedback = {
      id: `fb-${Date.now()}`,
      userId: (session.user as any).id || session.user.email || "anonymous",
      userName: session.user.name || "Anonymous",
      projectId,
      moduleId,
      conversationId,
      type,
      category,
      rating,
      comment,
      context,
      createdAt: new Date().toISOString(),
    };

    // Store feedback (in demo mode, use in-memory storage)
    inMemoryStore.feedbacks.push(feedback);

    console.log("📝 Feedback received:", {
      type: feedback.type,
      category: feedback.category,
      user: feedback.userName,
      rating: feedback.rating,
    });

    return NextResponse.json({
      success: true,
      feedbackId: feedback.id,
      message: "Thank you for your feedback!",
    });
  } catch (error: any) {
    console.error("Error submitting feedback:", error);
    return NextResponse.json(
      { error: error.message || "Failed to submit feedback" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const category = searchParams.get("category");
    const userId = (session.user as any).id || session.user.email;

    let feedbacks = inMemoryStore.feedbacks;

    // Filter by project
    if (projectId) {
      feedbacks = feedbacks.filter((f) => f.projectId === projectId);
    }

    // Filter by category
    if (category) {
      feedbacks = feedbacks.filter((f) => f.category === category);
    }

    // Only return user's own feedback
    feedbacks = feedbacks.filter((f) => f.userId === userId);

    return NextResponse.json({
      feedbacks: feedbacks,
      total: feedbacks.length,
    });
  } catch (error: any) {
    console.error("Error fetching feedback:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch feedback" },
      { status: 500 }
    );
  }
}
