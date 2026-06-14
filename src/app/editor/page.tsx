"use client";

import { useState, useEffect, Suspense } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, addDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

interface Revision {
  title: string;
  content: string;
  editedAt: string;
}

function EditorContent() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [sessionStartTime, setSessionStartTime] = useState("");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  
  const [existingMemory, setExistingMemory] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");

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
          console.warn("Location permission denied or failed:", err);
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
          // Verify user owns it
          if (auth.currentUser && data.userId !== auth.currentUser.uid) {
            router.push("/dashboard");
            return;
          }
          setExistingMemory(data);
          setTitle(data.title || "");
          setContent(data.content || "");
        } else {
          router.push("/dashboard");
        }
      };
      fetchMemory();
    }
  }, [editId, router]);

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) {
      router.push("/login");
      return;
    }

    if (!title.trim() || !content.trim()) {
      setError("Please fill in both the title and the message.");
      setTimeout(() => setError(""), 4000);
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (isEditMode && editId && existingMemory) {
        // Push current existing state to history array
        const oldRevision: Revision = {
          title: existingMemory.title || "",
          content: existingMemory.content || "",
          editedAt: new Date().toISOString()
        };
        const updatedHistory = [...(existingMemory.history || []), oldRevision];
        
        const docRef = doc(db, "memories", editId);
        await updateDoc(docRef, {
          title,
          content,
          history: updatedHistory,
          sessionEndTime: new Date().toISOString(), // Update last edited time
        });
      } else {
        await addDoc(collection(db, "memories"), {
          userId: user.uid,
          title,
          content,
          history: [],
          sessionStartTime: sessionStartTime || new Date().toISOString(),
          sessionEndTime: new Date().toISOString(),
          location: location || null,
          createdAt: new Date().toISOString(),
        });
      }
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Error saving memory:", error);
      setError(`Failed to save: ${error?.message || "Unknown error"}`);
      setTimeout(() => setError(""), 8000);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black relative z-10 flex flex-col">
      <header className="border-b border-white/10 p-6 md:p-8 flex items-center justify-between sticky top-0 bg-black/80 backdrop-blur-xl z-20">
        <Link href="/dashboard" className="flex items-center space-x-2 text-white/50 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium tracking-wide">Back</span>
        </Link>
        
        <div className="flex items-center space-x-6">
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="text-red-400 text-sm font-medium"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center space-x-2 bg-white text-black px-6 py-2 font-bold hover:bg-white/90 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? "Sealing..." : "Seal Capsule"}</span>
          </button>
        </div>
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto p-6 md:p-12 flex flex-col">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 flex flex-col"
        >
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Capsule Title"
            className="w-full bg-transparent text-5xl md:text-7xl font-medium text-white placeholder-white/20 border-none focus:ring-0 p-0 mb-8 font-serif italic tracking-normal"
          />

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your message to the future..."
            className="flex-1 w-full bg-transparent text-xl md:text-2xl text-white/80 placeholder-white/20 border-none focus:ring-0 p-0 resize-none font-light leading-relaxed"
          />
        </motion.div>
      </main>
    </div>
  );
}

export default function EditorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <EditorContent />
    </Suspense>
  );
}
