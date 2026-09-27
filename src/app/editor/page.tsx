/**
 * Motion Intent: Editor writing space with focused micro-interactions.
 * - Button springs for dictation and saving.
 * - Pulsing visual cue when voice dictation is active.
 * - Smooth entrance and exit of feedback banners.
 * - Minimal, high-focus typographic workspace.
 */

"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { auth, db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { collection, addDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Save, Mic, MicOff, Check, Compass } from "lucide-react";
import { pageVariants, buttonMotion } from "@/lib/motion.config";

interface Revision {
  title: string;
  content: string;
  editedAt: string;
}

const AVAILABLE_TAGS = [
  "Epiphany",
  "Nostalgia",
  "Void",
  "Midnight",
  "Lucid",
  "Solitude",
  "Future Self"
];

function EditorContent() {
  const { user, loading: authLoading } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("Void");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  const [sessionStartTime, setSessionStartTime] = useState("");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [sessionElapsedSeconds, setSessionElapsedSeconds] = useState(0);

  const [existingMemory, setExistingMemory] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSessionElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognitionClass) {
      const recognizer = new SpeechRecognitionClass();
      recognizer.continuous = true;
      recognizer.interimResults = true;
      recognizer.lang = "en-US";

      recognizer.onresult = (event: any) => {
        let finalTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const item = event.results[i];
          if (item.isFinal) {
            finalTranscript += item[0].transcript + " ";
          }
        }
        if (finalTranscript) {
          setContent((prev) => (prev ? `${prev} ${finalTranscript.trim()}` : finalTranscript.trim()));
        }
      };

      recognizer.onerror = (event: any) => {
        console.warn("Speech error:", event.error);
        if (event.error === "not-allowed") {
          setError("Microphone permission denied.");
        }
        setIsListening(false);
      };

      recognizer.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognizer;
    } else {
      setSpeechSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const toggleSpeech = () => {
    if (!speechSupported || !recognitionRef.current) {
      setError("Speech recognition is not supported in this browser.");
      setTimeout(() => setError(""), 4000);
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setError("");
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error("Speech start error:", err);
      }
    }
  };

  useEffect(() => {
    setSessionStartTime(new Date().toISOString());
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (err) => {
          console.warn("Location error:", err);
        }
      );
    }

    if (editId) {
      setIsEditMode(true);
      const fetchMemory = async () => {
        const docRef = doc(db, "memories", editId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (auth.currentUser && data.userId !== auth.currentUser.uid) {
            router.push("/dashboard");
            return;
          }
          setExistingMemory(data);
          setTitle(data.title || "");
          setContent(data.content || "");
          if (data.tag) setSelectedTag(data.tag);
        } else {
          router.push("/dashboard");
        }
      };
      fetchMemory();
    } else {
      const savedDraft = localStorage.getItem("milkdream_editor_draft");
      if (savedDraft) {
        try {
          const parsed = JSON.parse(savedDraft);
          if (parsed.title || parsed.content) {
            setTitle(parsed.title || "");
            setContent(parsed.content || "");
            if (parsed.tag) setSelectedTag(parsed.tag);
          }
        } catch (e) {}
      }
    }
  }, [editId, router]);

  useEffect(() => {
    if (!isEditMode && (title || content)) {
      const timeout = setTimeout(() => {
        localStorage.setItem(
          "milkdream_editor_draft",
          JSON.stringify({ title, content, tag: selectedTag, updatedAt: new Date().toISOString() })
        );
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [title, content, selectedTag, isEditMode]);

  const handleSave = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      router.push("/login");
      return;
    }

    if (!title.trim() || !content.trim()) {
      setError("Please inscribe both a title and your reflection.");
      setTimeout(() => setError(""), 4000);
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (isEditMode && editId && existingMemory) {
        const oldRevision: Revision = {
          title: existingMemory.title || "",
          content: existingMemory.content || "",
          editedAt: new Date().toISOString(),
        };
        const updatedHistory = [...(existingMemory.history || []), oldRevision];

        const docRef = doc(db, "memories", editId);
        await updateDoc(docRef, {
          title,
          content,
          tag: selectedTag,
          history: updatedHistory,
          sessionEndTime: new Date().toISOString(),
        });
      } else {
        await addDoc(collection(db, "memories"), {
          userId: currentUser.uid,
          title,
          content,
          tag: selectedTag,
          history: [],
          sessionStartTime: sessionStartTime || new Date().toISOString(),
          sessionEndTime: new Date().toISOString(),
          location: location || null,
          createdAt: new Date().toISOString(),
        });
        localStorage.removeItem("milkdream_editor_draft");
      }

      setSaveSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 500);
    } catch (err: any) {
      console.error("Error saving:", err);
      setError(`Failed to save: ${err?.message || "Unknown error"}`);
      setLoading(false);
    }
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const elapsedMinutes = Math.floor(sessionElapsedSeconds / 60);
  const elapsedSecs = sessionElapsedSeconds % 60;

  if (authLoading) {
    return (
      <div className="py-24 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="py-8"
    >
      {/* Top Header Controls */}
      <div className="flex items-center justify-between pb-6 mb-8 border-b border-[#27272a] gap-4">
        <Link href="/dashboard" className="flex items-center space-x-2 text-sm text-[#71717a] hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Archive</span>
        </Link>

        {/* Live Writing Info */}
        <div className="hidden sm:flex items-center space-x-4 text-xs font-mono text-[#71717a]">
          <span>
            {elapsedMinutes.toString().padStart(2, "0")}:{elapsedSecs.toString().padStart(2, "0")}
          </span>
          <span>&bull;</span>
          <span>{wordCount} Words</span>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-3">
          {/* Speech Dictation Button */}
          <motion.button
            {...buttonMotion}
            type="button"
            onClick={toggleSpeech}
            aria-label="Toggle voice dictation"
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md border text-xs font-medium transition-colors ${
              isListening
                ? "border-red-500 bg-red-950/30 text-red-300 animate-pulse"
                : "border-[#27272a] bg-[#121215] text-[#71717a] hover:text-white hover:border-[#3f3f46]"
            }`}
          >
            {isListening ? <Mic className="w-3.5 h-3.5 text-red-400" /> : <MicOff className="w-3.5 h-3.5" />}
            <span>{isListening ? "Listening..." : "Dictate"}</span>
          </motion.button>

          {/* Save Button */}
          <motion.button
            {...buttonMotion}
            onClick={handleSave}
            disabled={loading}
            className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-md font-semibold text-xs tracking-wider uppercase transition-colors ${
              saveSuccess
                ? "bg-emerald-400 text-black"
                : "bg-white text-black hover:bg-neutral-200"
            }`}
          >
            {saveSuccess ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Sealed</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>{loading ? "Sealing..." : isEditMode ? "Update" : "Seal"}</span>
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-6 p-3 rounded-lg border border-red-500/30 bg-red-950/20 text-red-300 text-xs font-mono"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Resonance Tag Selector */}
      <div className="flex flex-wrap items-center gap-2 mb-8">
        <span className="text-xs font-mono text-[#71717a] mr-2">Resonance:</span>
        {AVAILABLE_TAGS.map((tag) => (
          <motion.button
            key={tag}
            {...buttonMotion}
            type="button"
            onClick={() => setSelectedTag(tag)}
            className={`text-xs px-3 py-1 rounded-md border font-mono transition-colors ${
              selectedTag === tag
                ? "bg-white text-black border-white font-medium"
                : "bg-[#121215] text-[#71717a] border-[#27272a] hover:text-white hover:border-[#3f3f46]"
            }`}
          >
            {tag}
          </motion.button>
        ))}
      </div>

      {/* Title Input */}
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Name your reflection..."
        aria-label="Reflection title"
        className="w-full bg-transparent text-3xl sm:text-5xl font-bold tracking-tight text-white placeholder-[#3f3f46] border-none focus:outline-none mb-6 p-0"
      />

      {/* Reflection Textarea */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write or speak your thoughts into the void..."
        aria-label="Reflection content"
        rows={16}
        className="w-full bg-transparent text-base sm:text-lg text-[#fafafa] placeholder-[#3f3f46] border-none focus:outline-none resize-none font-normal leading-relaxed p-0 mb-8"
      />

      {/* Spatial Anchor Status */}
      <div className="pt-4 border-t border-[#27272a] flex items-center justify-between text-xs font-mono text-[#71717a]">
        <div className="flex items-center space-x-2">
          <Compass className="w-3.5 h-3.5 text-white/50" />
          <span>
            {location 
              ? `Spatial Anchor: ${location.lat.toFixed(4)}°, ${location.lng.toFixed(4)}°`
              : "Locating coordinates..."}
          </span>
        </div>
        <span className="hidden sm:inline">Draft saved locally</span>
      </div>
    </motion.div>
  );
}

export default function EditorPage() {
  return (
    <Suspense fallback={<div className="py-24 text-center text-[#71717a] text-sm">Loading Editor...</div>}>
      <EditorContent />
    </Suspense>
  );
}
