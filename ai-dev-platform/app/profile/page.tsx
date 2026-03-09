"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, BookOpen, ArrowLeft, Loader2, Save } from "lucide-react";

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [knowledgeLevel, setKnowledgeLevel] = useState<"beginner" | "intermediate" | "advanced">("beginner");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/profile");
    }
    if (session?.user) {
      setKnowledgeLevel(session.user.knowledgeLevel || "beginner");
    }
  }, [status, session, router]);

  const handleSave = async () => {
    setSaving(true);
    setMessage("");

    try {
      // Update knowledge level (in production, make API call)
      await update({
        ...session,
        user: {
          ...session?.user,
          knowledgeLevel,
        },
      });

      setMessage("Profile updated successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-400 animate-spin" />
      </div>
    );
  }

  if (!session) return null;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-4">
      <div className="max-w-2xl mx-auto pt-20">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </motion.button>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass p-8 rounded-2xl"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{session.user.name}</h1>
              <p className="text-slate-400">{session.user.email}</p>
            </div>
          </div>

          <div className="border-t border-slate-700 pt-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-400" />
              Knowledge Level
            </h2>

            <div className="space-y-3 mb-6">
              <label className="flex items-center p-4 bg-slate-800/50 rounded-lg cursor-pointer hover:bg-slate-800 transition-colors border-2 border-transparent has-[:checked]:border-blue-500">
                <input
                  type="radio"
                  name="knowledgeLevel"
                  value="beginner"
                  checked={knowledgeLevel === "beginner"}
                  onChange={(e) => setKnowledgeLevel(e.target.value as any)}
                  className="mr-3"
                />
                <div className="flex-1">
                  <div className="text-white font-medium">Beginner</div>
                  <div className="text-sm text-slate-400">
                    New to programming - I need detailed explanations with examples
                  </div>
                </div>
              </label>

              <label className="flex items-center p-4 bg-slate-800/50 rounded-lg cursor-pointer hover:bg-slate-800 transition-colors border-2 border-transparent has-[:checked]:border-blue-500">
                <input
                  type="radio"
                  name="knowledgeLevel"
                  value="intermediate"
                  checked={knowledgeLevel === "intermediate"}
                  onChange={(e) => setKnowledgeLevel(e.target.value as any)}
                  className="mr-3"
                />
                <div className="flex-1">
                  <div className="text-white font-medium">Intermediate</div>
                  <div className="text-sm text-slate-400">
                    Some programming experience - I understand basic concepts
                  </div>
                </div>
              </label>

              <label className="flex items-center p-4 bg-slate-800/50 rounded-lg cursor-pointer hover:bg-slate-800 transition-colors border-2 border-transparent has-[:checked]:border-blue-500">
                <input
                  type="radio"
                  name="knowledgeLevel"
                  value="advanced"
                  checked={knowledgeLevel === "advanced"}
                  onChange={(e) => setKnowledgeLevel(e.target.value as any)}
                  className="mr-3"
                />
                <div className="flex-1">
                  <div className="text-white font-medium">Advanced</div>
                  <div className="text-sm text-slate-400">
                    Experienced developer - I prefer concise technical explanations
                  </div>
                </div>
              </label>
            </div>

            {message && (
              <div className={`p-3 rounded-lg mb-4 ${
                message.includes("success")
                  ? "bg-green-500/10 border border-green-500 text-green-400"
                  : "bg-red-500/10 border border-red-500 text-red-400"
              }`}>
                {message}
              </div>
            )}

            <button
              onClick={handleSave}
              disabled={saving || knowledgeLevel === session.user.knowledgeLevel}
              className="w-full py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass p-6 rounded-xl mt-6"
        >
          <h3 className="text-white font-medium mb-2">How Knowledge Level Works</h3>
          <p className="text-slate-400 text-sm">
            Your knowledge level helps us tailor explanations, code generation, and learning paths to match your experience. As you progress, update your level to receive more advanced content.
          </p>
        </motion.div>
      </div>
    </main>
  );
}
