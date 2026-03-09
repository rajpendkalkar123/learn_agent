"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BookOpen, 
  CheckCircle, 
  Circle, 
  Clock, 
  Play, 
  ChevronRight, 
  Award,
  ArrowLeft,
  Lock
} from "lucide-react";
import { useRouter } from "next/navigation";

interface LearningModule {
  id: string;
  title: string;
  description: string;
  content: string;
  order: number;
  duration: number;
  type: string;
  prerequisites: string[];
  resources: any[];
  checkpoint?: any;
}

interface LearningPath {
  id: string;
  projectId: string;
  name: string;
  description: string;
  modules: LearningModule[];
  knowledgeLevel: string;
  createdAt: string;
  estimatedDuration: number;
}

interface Progress {
  userId: string;
  learningPathId: string;
  completedModules: string[];
  currentModuleId: string | null;
  checkpointScores: Record<string, number>;
  timeSpent: number;
  completionPercentage: number;
}

export default function LearningPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const projectId = params.projectId as string;
  
  const [learningPath, setLearningPath] = useState<LearningPath | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [selectedModule, setSelectedModule] = useState<LearningModule | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [showCheckpoint, setShowCheckpoint] = useState(false);
  const [checkpointAnswers, setCheckpointAnswers] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchLearningPath();
    fetchProgress();
  }, [projectId]);

  const fetchLearningPath = async () => {
    try {
      const res = await fetch(`/api/learning/${projectId}`);
      const data = await res.json();
      setLearningPath(data);
    } catch (error) {
      console.error("Error fetching learning path:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProgress = async () => {
    try {
      const res = await fetch(`/api/progress/${projectId}`);
      const data = await res.json();
      setProgress(data);
    } catch (error) {
      console.error("Error fetching progress:", error);
    }
  };

  const startModule = (module: LearningModule) => {
    setSelectedModule(module);
    setStartTime(Date.now());
    setShowCheckpoint(false);
  };

  const completeModule = async () => {
    if (!selectedModule || !progress) return;

    const timeSpent = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
    
    const updatedProgress = {
      ...progress,
      completedModules: [...new Set([...progress.completedModules, selectedModule.id])],
      currentModuleId: selectedModule.id,
      timeSpent: progress.timeSpent + timeSpent,
      completionPercentage: Math.round(
        ((progress.completedModules.length + 1) / (learningPath?.modules.length || 1)) * 100
      ),
    };

    try {
      const res = await fetch(`/api/progress/${projectId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedProgress),
      });
      const data = await res.json();
      setProgress(data);
      
      if (selectedModule.checkpoint) {
        setShowCheckpoint(true);
      } else {
        setSelectedModule(null);
      }
    } catch (error) {
      console.error("Error updating progress:", error);
    }
  };

  const submitCheckpoint = async () => {
    if (!selectedModule?.checkpoint || !progress) return;

    const questions = selectedModule.checkpoint.questions;
    let correct = 0;
    
    questions.forEach((q: any, idx: number) => {
      if (checkpointAnswers[q.id] === q.correctAnswer) {
        correct++;
      }
    });

    const score = Math.round((correct / questions.length) * 100);
    
    const updatedProgress = {
      ...progress,
      checkpointScores: {
        ...progress.checkpointScores,
        [selectedModule.id]: score,
      },
    };

    try {
      await fetch(`/api/progress/${projectId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedProgress),
      });
      setProgress(updatedProgress);
      setSelectedModule(null);
      setShowCheckpoint(false);
      setCheckpointAnswers({});
    } catch (error) {
      console.error("Error submitting checkpoint:", error);
    }
  };

  const isModuleUnlocked = (module: LearningModule): boolean => {
    if (!progress) return false;
    if (module.prerequisites.length === 0) return true;
    return module.prerequisites.every((prereq) =>
      progress.completedModules.includes(prereq)
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white">Loading learning path...</div>
      </div>
    );
  }

  if (!learningPath) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white">No learning path found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-10 glass border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push(`/workspace/${projectId}`)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-white">{learningPath.name}</h1>
                <p className="text-sm text-slate-400">{learningPath.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="text-sm text-slate-400">Progress</div>
                <div className="text-2xl font-bold text-blue-400">
                  {progress?.completionPercentage || 0}%
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-slate-400">Time Spent</div>
                <div className="text-lg font-semibold text-white">
                  {Math.floor((progress?.timeSpent || 0) / 60)}m
                </div>
              </div>
            </div>
          </div>
          {/* Progress Bar */}
          <div className="mt-4 h-2 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress?.completionPercentage || 0}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {selectedModule ? (
            <motion.div
              key="module-content"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="glass p-8 rounded-2xl"
            >
              {showCheckpoint && selectedModule.checkpoint ? (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">
                    Knowledge Checkpoint
                  </h2>
                  <div className="space-y-6">
                    {selectedModule.checkpoint.questions.map((q: any, idx: number) => (
                      <div key={q.id} className="p-4 bg-slate-800/50 rounded-lg">
                        <p className="text-white font-medium mb-3">
                          {idx + 1}. {q.question}
                        </p>
                        <div className="space-y-2">
                          {q.options.map((option: string, optIdx: number) => (
                            <label
                              key={optIdx}
                              className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-700/50 cursor-pointer transition-colors"
                            >
                              <input
                                type="radio"
                                name={q.id}
                                checked={checkpointAnswers[q.id] === optIdx}
                                onChange={() =>
                                  setCheckpointAnswers((prev) => ({
                                    ...prev,
                                    [q.id]: optIdx,
                                  }))
                                }
                                className="w-4 h-4"
                              />
                              <span className="text-slate-300">{option}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={submitCheckpoint}
                    disabled={
                      Object.keys(checkpointAnswers).length <
                      selectedModule.checkpoint.questions.length
                    }
                    className="mt-6 px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                  >
                    Submit Answers
                  </button>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-3xl font-bold text-white">
                      {selectedModule.title}
                    </h2>
                    <div className="flex items-center gap-2 text-slate-400">
                      <Clock className="w-4 h-4" />
                      <span>{selectedModule.duration} min</span>
                    </div>
                  </div>
                  
                  <div 
                    className="prose prose-invert max-w-none mb-8"
                    dangerouslySetInnerHTML={{ 
                      __html: selectedModule.content.replace(/\n/g, '<br/>').replace(/##/g, '<h2>').replace(/#/g, '<h1>') 
                    }}
                  />

                  {selectedModule.resources && selectedModule.resources.length > 0 && (
                    <div className="mt-8 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                      <h3 className="text-lg font-semibold text-white mb-3">
                        Additional Resources
                      </h3>
                      <div className="space-y-2">
                        {selectedModule.resources.map((resource: any, idx: number) => (
                          <div key={idx} className="flex items-center gap-2 text-blue-400">
                            <BookOpen className="w-4 h-4" />
                            <span>{resource.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4 mt-8">
                    <button
                      onClick={() => setSelectedModule(null)}
                      className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
                    >
                      Back to Modules
                    </button>
                    <button
                      onClick={completeModule}
                      className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg font-medium transition-all flex items-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Complete Module
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="module-list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid gap-4"
            >
              {learningPath.modules.map((module) => {
                const isCompleted = progress?.completedModules.includes(module.id);
                const isUnlocked = isModuleUnlocked(module);
                const checkpointScore = progress?.checkpointScores[module.id];

                return (
                  <motion.div
                    key={module.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`glass p-6 rounded-xl hover:border-blue-500/30 transition-all ${
                      !isUnlocked ? "opacity-50" : "cursor-pointer"
                    }`}
                    onClick={() => isUnlocked && startModule(module)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        {isCompleted ? (
                          <CheckCircle className="w-6 h-6 text-green-400" />
                        ) : isUnlocked ? (
                          <Circle className="w-6 h-6 text-slate-400" />
                        ) : (
                          <Lock className="w-6 h-6 text-slate-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-white mb-1">
                              {module.title}
                            </h3>
                            <p className="text-slate-400 text-sm mb-3">
                              {module.description}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-slate-400">
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {module.duration} min
                              </span>
                              <span className="px-2 py-1 bg-slate-700 rounded-md">
                                {module.type}
                              </span>
                              {checkpointScore !== undefined && (
                                <span className="flex items-center gap-1">
                                  <Award className="w-4 h-4 text-yellow-400" />
                                  {checkpointScore}%
                                </span>
                              )}
                            </div>
                          </div>
                          {isUnlocked && (
                            <ChevronRight className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
