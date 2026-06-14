"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Plus, Clock, X, MapPin, Edit2, History, FileText, ChevronDown } from "lucide-react";
import Tilt from "react-parallax-tilt";
import SpotlightCard from "@/components/SpotlightCard";

interface Revision {
  title: string;
  content: string;
  editedAt: string;
}

interface Memory {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  sessionStartTime?: string;
  sessionEndTime?: string;
  location?: { lat: number; lng: number };
  history?: Revision[];
}

export default function DashboardPage() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchMemories = async () => {
      const user = auth.currentUser;
      if (!user) {
        router.push("/login");
        return;
      }

      try {
        const q = query(
          collection(db, "memories"),
          where("userId", "==", user.uid)
        );
        
        const querySnapshot = await getDocs(q);
        const fetchedMemories: Memory[] = [];
        querySnapshot.forEach((doc) => {
          fetchedMemories.push({ id: doc.id, ...doc.data() } as Memory);
        });
        
        // Sort in memory to avoid Firebase composite index requirement
        fetchedMemories.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        setMemories(fetchedMemories);
      } catch (error) {
        console.error("Error fetching memories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMemories();
  }, [router]);

  return (
    <div className="min-h-screen p-6 md:p-20 relative z-10">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-20 border-b border-white/10 pb-10 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-5xl md:text-7xl font-medium tracking-normal mb-4 text-white font-serif italic">Archive.</h1>
            <p className="text-white/50 text-xl font-light">Immutable records of your journey.</p>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <Link 
              href="/editor" 
              className="flex items-center space-x-2 border border-white/20 text-white px-8 py-4 font-light hover:border-white hover:bg-white/5 transition-all active:scale-95 text-lg tracking-wide uppercase"
            >
              <Plus className="w-5 h-5" />
              <span>New Entry</span>
            </Link>
          </motion.div>
        </header>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        ) : memories.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="text-center py-40 border border-white/10 bg-white/5 glass-layer"
          >
            <Clock className="w-12 h-12 text-white/20 mx-auto mb-6" />
            <h3 className="text-3xl font-light text-white mb-2 tracking-tight">The void is empty</h3>
            <p className="text-white/50 mb-8 font-light text-lg">Create your first entry.</p>
            <Link 
              href="/editor" 
              className="inline-flex items-center space-x-2 text-white border-b border-white hover:text-white/70 hover:border-white/70 transition-all pb-1 text-lg"
            >
              <Plus className="w-5 h-5" />
              <span>Create Entry</span>
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {memories.map((memory, index) => {
              return (
                <motion.div
                  key={memory.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="h-full"
                >
                  <Tilt
                    tiltMaxAngleX={5}
                    tiltMaxAngleY={5}
                    perspective={1000}
                    scale={1.02}
                    transitionSpeed={2000}
                    className="h-full"
                  >
                    <div 
                      onClick={() => setSelectedMemory(memory)} 
                      className="h-full cursor-pointer"
                    >
                      <SpotlightCard className="h-full flex flex-col p-8 group border border-white/10 hover:border-white/20 transition-all">
                        <div className="flex justify-between items-start mb-6">
                          <div className="bg-white/5 p-3 border border-white/10">
                            <FileText className="w-5 h-5 text-white" />
                          </div>
                          <span className="text-xs tracking-widest uppercase text-white/40 font-mono">
                            {new Date(memory.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <h3 className="text-2xl font-bold mb-4 text-white tracking-tight line-clamp-2">{memory.title}</h3>
                        
                        <div className="mt-auto pt-6 border-t border-white/10">
                          <div>
                            <p className="text-white/60 line-clamp-3 font-light leading-relaxed mb-4">
                              {memory.content}
                            </p>
                            <div className="flex justify-between items-center mt-4">
                              <span className="text-xs tracking-widest uppercase text-white/30 group-hover:text-white transition-colors">
                                Read Entry &rarr;
                              </span>
                              {memory.history && memory.history.length > 0 && (
                                <span className="text-xs tracking-widest uppercase text-white/40 flex items-center space-x-1">
                                  <History className="w-3 h-3" />
                                  <span>{memory.history.length} Edits</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </SpotlightCard>
                    </div>
                  </Tilt>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedMemory && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl"
          >
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="bg-[#050505] border border-white/10 w-full max-w-3xl max-h-[85vh] overflow-y-auto relative"
            >
              <div className="sticky top-0 float-right p-6 z-10 flex space-x-4 bg-gradient-to-b from-[#050505] to-transparent">
                <Link 
                  href={`/editor?id=${selectedMemory.id}`}
                  className="flex items-center space-x-2 text-white/40 hover:text-white transition-colors px-3 py-1 border border-white/10 bg-black"
                >
                  <Edit2 className="w-4 h-4" />
                  <span className="text-sm font-medium tracking-wide">Edit</span>
                </Link>
                <button 
                  onClick={() => setSelectedMemory(null)}
                  className="text-white/40 hover:text-white transition-colors bg-black border border-white/10 p-1"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6 md:p-16">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 border-b border-white/10 pb-6 md:pb-8">
                  <div className="flex items-center space-x-4">
                    <div className="bg-white/5 p-3 border border-white/10">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs tracking-widest uppercase text-white/40 font-mono">Captured</p>
                      <p className="text-sm tracking-widest uppercase text-white font-mono">
                        {new Date(selectedMemory.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {(selectedMemory.sessionStartTime || selectedMemory.sessionEndTime) && (
                    <div className="flex items-center space-x-4">
                      <div className="bg-white/5 p-3 border border-white/10">
                        <Clock className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs tracking-widest uppercase text-white/40 font-mono">Temporal Span</p>
                        <p className="text-sm tracking-widest uppercase text-white font-mono">
                          {selectedMemory.sessionStartTime ? new Date(selectedMemory.sessionStartTime).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) : "??"} 
                          &mdash; 
                          {selectedMemory.sessionEndTime ? new Date(selectedMemory.sessionEndTime).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) : "??"}
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedMemory.location && (
                    <div className="flex items-center space-x-4">
                      <div className="bg-white/5 p-3 border border-white/10">
                        <MapPin className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs tracking-widest uppercase text-white/40 font-mono">Spatial Anchor</p>
                        <p className="text-sm tracking-widest uppercase text-white font-mono">
                          {Math.abs(selectedMemory.location.lat).toFixed(4)}&deg; {selectedMemory.location.lat >= 0 ? 'N' : 'S'}, {Math.abs(selectedMemory.location.lng).toFixed(4)}&deg; {selectedMemory.location.lng >= 0 ? 'E' : 'W'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <h2 className="text-3xl sm:text-4xl md:text-6xl font-medium tracking-normal mb-8 md:mb-12 text-white font-serif italic leading-tight">
                  {selectedMemory.title}
                </h2>

                <div className="prose prose-invert max-w-none mb-16">
                  <p className="text-xl leading-relaxed text-white/70 font-light whitespace-pre-wrap">
                    {selectedMemory.content}
                  </p>
                </div>

                {selectedMemory.history && selectedMemory.history.length > 0 && (
                  <div className="mt-16 border-t border-white/10 pt-16">
                    <h3 className="text-2xl font-serif italic text-white/80 mb-8">Revision History</h3>
                    <div className="space-y-4">
                      {selectedMemory.history.map((rev, idx) => (
                        <details key={idx} className="bg-white/5 border border-white/10 group">
                          <summary className="p-6 flex justify-between items-center cursor-pointer list-none hover:bg-white/5 transition-colors">
                            <div className="flex items-center space-x-4">
                              <History className="w-5 h-5 text-white/40" />
                              <span className="text-sm font-mono text-white/60">
                                {new Date(rev.editedAt).toLocaleString()}
                              </span>
                            </div>
                            <ChevronDown className="w-5 h-5 text-white/40 group-open:rotate-180 transition-transform" />
                          </summary>
                          <div className="p-6 pt-0 border-t border-white/10 mt-2">
                            <h4 className="text-xl font-medium text-white/80 mb-4 mt-6">{rev.title}</h4>
                            <div className="prose prose-invert max-w-none text-white/50 font-light whitespace-pre-wrap leading-relaxed">
                              {rev.content}
                            </div>
                          </div>
                        </details>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
