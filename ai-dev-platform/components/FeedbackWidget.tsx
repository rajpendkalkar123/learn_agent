"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown, MessageSquare, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FeedbackWidgetProps {
  projectId?: string;
  moduleId?: string;
  conversationId?: string;
  category: "explanation" | "code_generation" | "architecture" | "learning_path" | "ui" | "other";
  context?: any;
  inline?: boolean;
}

export default function FeedbackWidget({
  projectId,
  moduleId,
  conversationId,
  category,
  context,
  inline = false,
}: FeedbackWidgetProps) {
  const [showDetailedForm, setShowDetailedForm] = useState(false);
  const [selectedType, setSelectedType] = useState<"thumbs_up" | "thumbs_down" | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleQuickFeedback = async (type: "thumbs_up" | "thumbs_down") => {
    setSelectedType(type);
    
    if (type === "thumbs_up") {
      // For positive feedback, submit immediately
      await submitFeedback(type, 5, "");
    } else {
      // For negative feedback, show detailed form
      setShowDetailedForm(true);
    }
  };

  const submitFeedback = async (
    type: "thumbs_up" | "thumbs_down",
    feedbackRating: number,
    feedbackComment: string
  ) => {
    setSubmitting(true);

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          moduleId,
          conversationId,
          type,
          category,
          rating: feedbackRating,
          comment: feedbackComment,
          context,
        }),
      });

      if (response.ok) {
        setSubmitted(true);
        setTimeout(() => {
          setShowDetailedForm(false);
          setSubmitted(false);
          setSelectedType(null);
        }, 2000);
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDetailedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedType) {
      await submitFeedback(selectedType, rating, comment);
    }
  };

  if (inline) {
    return (
      <div className="flex items-center gap-2">
        {!submitted ? (
          <>
            <button
              onClick={() => handleQuickFeedback("thumbs_up")}
              disabled={submitting}
              className={`p-1.5 rounded transition-colors ${
                selectedType === "thumbs_up"
                  ? "bg-green-500/20 text-green-400"
                  : "hover:bg-slate-800 text-slate-400 hover:text-green-400"
              }`}
              title="Helpful"
            >
              <ThumbsUp className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleQuickFeedback("thumbs_down")}
              disabled={submitting}
              className={`p-1.5 rounded transition-colors ${
                selectedType === "thumbs_down"
                  ? "bg-red-500/20 text-red-400"
                  : "hover:bg-slate-800 text-slate-400 hover:text-red-400"
              }`}
              title="Not helpful"
            >
              <ThumbsDown className="w-4 h-4" />
            </button>
          </>
        ) : (
          <span className="text-xs text-green-400">Thanks for your feedback!</span>
        )}

        <AnimatePresence>
          {showDetailedForm && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowDetailedForm(false)}
            >
              <motion.div
                initial={{ y: 20 }}
                animate={{ y: 0 }}
                className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">
                    Help us improve
                  </h3>
                  <button
                    onClick={() => setShowDetailedForm(false)}
                    className="p-1 hover:bg-slate-800 rounded transition-colors"
                  >
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>

                <form onSubmit={handleDetailedSubmit}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      How would you rate this? (Optional)
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className={`w-10 h-10 rounded-lg transition-colors ${
                            rating >= star
                              ? "bg-yellow-500/20 text-yellow-400"
                              : "bg-slate-800 text-slate-500 hover:bg-slate-700"
                          }`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Tell us more (Optional)
                    </label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="What could be improved?"
                      className="w-full px-3 py-2 bg-slate-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      rows={4}
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                      {submitting ? "Submitting..." : "Submit Feedback"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDetailedForm(false)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Floating button version (not inline)
  return (
    <div className="fixed bottom-6 right-6 z-40">
      <AnimatePresence>
        {!submitted && !showDetailedForm && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setShowDetailedForm(true)}
            className="w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-full shadow-lg flex items-center justify-center text-white transition-transform hover:scale-110"
            title="Give feedback"
          >
            <MessageSquare className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDetailedForm && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="absolute bottom-0 right-0 bg-slate-900 border border-slate-700 rounded-xl p-6 w-80 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Feedback</h3>
              <button
                onClick={() => setShowDetailedForm(false)}
                className="p-1 hover:bg-slate-800 rounded transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {!submitted ? (
              <form onSubmit={handleDetailedSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    How is your experience?
                  </label>
                  <div className="flex gap-2 justify-center">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedType("thumbs_up");
                        setRating(5);
                      }}
                      className={`flex-1 p-3 rounded-lg transition-colors ${
                        selectedType === "thumbs_up"
                          ? "bg-green-500/20 text-green-400 border-2 border-green-500"
                          : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                      }`}
                    >
                      <ThumbsUp className="w-6 h-6 mx-auto" />
                      <div className="text-xs mt-1">Good</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedType("thumbs_down");
                        setRating(2);
                      }}
                      className={`flex-1 p-3 rounded-lg transition-colors ${
                        selectedType === "thumbs_down"
                          ? "bg-red-500/20 text-red-400 border-2 border-red-500"
                          : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                      }`}
                    >
                      <ThumbsDown className="w-6 h-6 mx-auto" />
                      <div className="text-xs mt-1">Bad</div>
                    </button>
                  </div>
                </div>

                {selectedType && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                  >
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Additional comments (Optional)
                      </label>
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Tell us more..."
                        className="w-full px-3 py-2 bg-slate-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                        rows={3}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                      {submitting ? "Submitting..." : "Submit Feedback"}
                    </button>
                  </motion.div>
                )}
              </form>
            ) : (
              <div className="text-center py-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <ThumbsUp className="w-6 h-6 text-green-400" />
                </div>
                <p className="text-white font-medium">Thank you!</p>
                <p className="text-sm text-slate-400 mt-1">
                  Your feedback helps us improve
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
