/**
 * Motion Intent: Dashboard with interactive card physics and modal transitions.
 * - Staggered entrance (stagger: 60ms, duration: 350ms, ease: [0.25, 0.1, 0.25, 1]).
 * - Card Hover: scale: 1.02, y: -2, 200ms spring (stiffness: 300, damping: 25).
 * - Modal: scale: 0.95 -> 1, opacity: 0 -> 1, 300ms easeOut; Exit: 200ms easeIn.
 * - Animates transform and opacity only for smooth 60fps performance.
 */

"use client";

import { useEffect, useState, useMemo } from "react";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { collection, query, where, getDocs, doc, deleteDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { 
  ArrowLeft,
  Plus, 
  Search, 
  X, 
  Trash2, 
  Download, 
  Edit2, 
  MapPin, 
  History, 
  Compass,
  ArrowRight
} from "lucide-react";
import { 
  pageVariants, 
  containerStagger, 
  cardVariants, 
  cardHoverMotion, 
  buttonMotion, 
  modalVariants, 
  modalBackdropVariants 
} from "@/lib/motion.config";

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
  tag?: string;
  sessionStartTime?: string;
  sessionEndTime?: string;
  location?: { lat: number; lng: number };
  history?: Revision[];
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTagFilter, setSelectedTagFilter] = useState<string>("All");
  const router = useRouter();

  useEffect(() => {
    if (!selectedMemory) return;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedMemory(null);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedMemory]);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    const fetchMemories = async () => {
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
        
        fetchedMemories.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setMemories(fetchedMemories);
      } catch (error) {
        console.error("Error fetching memories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMemories();
  }, [user, authLoading, router]);

  const handleDeleteMemory = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm("Are you sure you want to extinguish this memory forever?")) {
      return;
    }

    try {
      await deleteDoc(doc(db, "memories", id));
      setMemories((prev) => prev.filter((m) => m.id !== id));
      if (selectedMemory?.id === id) {
        setSelectedMemory(null);
      }
    } catch (err) {
      console.error("Error deleting memory:", err);
      alert("Failed to delete memory capsule.");
    }
  };

  const handleExportMemory = (memory: Memory, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const mdContent = `# ${memory.title}
Date: ${new Date(memory.createdAt).toLocaleString()}
Resonance Tag: ${memory.tag || "None"}
Location: ${memory.location ? `${memory.location.lat}, ${memory.location.lng}` : "Unknown"}
Temporal Span: ${memory.sessionStartTime || "N/A"} - ${memory.sessionEndTime || "N/A"}

---

${memory.content}

${memory.history && memory.history.length > 0 ? `\n## Revision History (${memory.history.length})\n` + memory.history.map((rev, i) => `### Revision ${i + 1} (${new Date(rev.editedAt).toLocaleString()})\n**${rev.title}**\n\n${rev.content}\n`).join("\n") : ""}
`;

    const blob = new Blob([mdContent], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${memory.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'capsule'}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    memories.forEach((m) => {
      if (m.tag) tags.add(m.tag);
    });
    return ["All", ...Array.from(tags)];
  }, [memories]);

  const filteredMemories = useMemo(() => {
    return memories.filter((m) => {
      const matchesSearch = 
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTag = selectedTagFilter === "All" || m.tag === selectedTagFilter;
      return matchesSearch && matchesTag;
    });
  }, [memories, searchQuery, selectedTagFilter]);

  const totalWords = useMemo(() => {
    return memories.reduce((acc, m) => {
      const words = m.content.trim() ? m.content.trim().split(/\s+/).length : 0;
      return acc + words;
    }, 0);
  }, [memories]);

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
      className="archive-dashboard"
    >
      {/* Header */}
      <header className="dashboard-heading">
        <div className="dashboard-title-block">
          <span className="dashboard-overline">PERSONAL MEMORY ARCHIVE / 01</span>
          <h1>Your archive<span>.</span></h1>
          <p>A record of moments, kept in your own words.</p>
        </div>

        <div className="dashboard-heading-action">
          <Link href="/editor">
            <motion.button
              {...buttonMotion}
              className="dashboard-new-entry"
            >
              <Plus className="w-4 h-4" />
              <span>Write a reflection</span>
            </motion.button>
          </Link>
        </div>
      </header>

      <section className="dashboard-statline" aria-label="Archive summary">
        <div><span>REFLECTIONS</span><strong>{memories.length.toLocaleString()}</strong></div>
        <div><span>WORDS KEPT</span><strong>{totalWords.toLocaleString()}</strong></div>
        <div><span>THREADS</span><strong>{Math.max(0, allTags.length - 1).toLocaleString()}</strong></div>
        <p>Each entry keeps its original place in your timeline.</p>
      </section>

      {/* Search & Tag Filter Toolbar */}
      {!loading && memories.length > 0 && (
        <div className="dashboard-toolbar">
          <div className="dashboard-search">
            <Search className="dashboard-search-icon" aria-hidden="true" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reflections..."
              aria-label="Search reflections"
              className="dashboard-search-input"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
                className="dashboard-clear-search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="dashboard-filters" role="group" aria-label="Filter by thread">
            {allTags.map((tag) => (
              <motion.button
                key={tag}
                {...buttonMotion}
                onClick={() => setSelectedTagFilter(tag)}
                className={`dashboard-filter ${
                  selectedTagFilter === tag
                    ? "bg-white text-black border-white font-medium"
                    : "bg-[#121215] text-[#71717a] border-[#27272a] hover:text-white hover:border-[#3f3f46]"
                }`}
              >
                {tag}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Memory Cards Grid */}
      <section className="dashboard-entries" aria-label="Saved reflections">
      <div className="dashboard-entries-heading">
        <h2>{searchQuery || selectedTagFilter !== "All" ? "Matching reflections" : "Recent reflections"}</h2>
        {!loading && memories.length > 0 && <span>{filteredMemories.length} {filteredMemories.length === 1 ? "entry" : "entries"}</span>}
      </div>
      {loading ? (
        <div className="dashboard-loading">
          <div className="w-7 h-7 rounded-full border-2 border-white/20 border-t-white animate-spin" />
        </div>
      ) : memories.length === 0 ? (
        <div className="dashboard-empty">
          <Compass className="w-8 h-8" aria-hidden="true" />
          <span className="dashboard-overline">A FRESH PAGE</span>
          <h2>Your archive begins here.</h2>
          <p>Save a thought, a detail, or a moment you want to return to.</p>
          <Link href="/editor">
            <motion.button
              {...buttonMotion}
              className="dashboard-new-entry"
            >
              <Plus className="w-4 h-4" /> Create first reflection
            </motion.button>
          </Link>
        </div>
      ) : filteredMemories.length === 0 ? (
        <div className="dashboard-no-results">
          <p>No reflections match this search.</p>
          <button
            onClick={() => { setSearchQuery(""); setSelectedTagFilter("All"); }}
            className="text-xs text-white underline"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <motion.div
          variants={containerStagger}
          initial="initial"
          animate="animate"
          className="dashboard-entry-list"
        >
          {filteredMemories.map((memory) => (
            <motion.article
              key={memory.id}
              variants={cardVariants}
              {...cardHoverMotion}
              className="dashboard-entry-row"
            >
              <button
                type="button"
                className="dashboard-entry-open"
                onClick={() => setSelectedMemory(memory)}
                aria-label={`Read reflection: ${memory.title}`}
              >
                <div className="dashboard-entry-meta">
                  <span>{new Date(memory.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}</span>
                  {memory.tag && (
                    <span className="dashboard-entry-tag">
                      {memory.tag}
                    </span>
                  )}
                </div>

                <h3 className="dashboard-entry-title">{memory.title}</h3>

                <p className="dashboard-entry-excerpt">
                  {memory.content}
                </p>
              </button>

              <div className="dashboard-entry-footer">
                <button
                  type="button"
                  className="dashboard-read-link"
                  onClick={() => setSelectedMemory(memory)}
                  aria-label={`Read reflection: ${memory.title}`}
                >
                  Read reflection <ArrowRight size={14} />
                </button>
                <div className="dashboard-entry-tools">
                  {memory.history && memory.history.length > 0 && (
                    <span className="flex items-center space-x-1">
                      <History className="w-3 h-3" />
                      <span>{memory.history.length}</span>
                    </span>
                  )}
                  <button
                    onClick={(e) => handleDeleteMemory(memory.id, e)}
                    aria-label="Delete memory"
                    className="dashboard-delete-entry"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>
      )}
      </section>

      {/* Reader Modal (300ms easeOut, reverse 200ms easeIn) */}
      <AnimatePresence>
        {selectedMemory && (
          <div className="memory-reader-overlay">
            <motion.div
              variants={modalBackdropVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              onClick={() => setSelectedMemory(null)}
              className="memory-reader-backdrop"
            />

            <motion.section
              variants={modalVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="memory-reader"
              role="dialog"
              aria-modal="true"
              aria-labelledby="memory-reader-title"
            >
              <header className="memory-reader-toolbar">
                <button
                  type="button"
                  onClick={() => setSelectedMemory(null)}
                  className="memory-reader-back"
                >
                  <ArrowLeft size={17} />
                  <span>Back to archive</span>
                </button>

                <div className="memory-reader-actions">
                  <motion.button
                    {...buttonMotion}
                    onClick={() => handleExportMemory(selectedMemory)}
                    className="memory-reader-action"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export</span>
                  </motion.button>
                  <Link href={`/editor?id=${selectedMemory.id}`}>
                    <motion.button
                      {...buttonMotion}
                      className="memory-reader-action"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </motion.button>
                  </Link>
                  <motion.button
                    {...buttonMotion}
                    onClick={() => handleDeleteMemory(selectedMemory.id)}
                    aria-label="Delete capsule"
                    className="memory-reader-action memory-reader-delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </motion.button>
                </div>
              </header>

              <div className="memory-reader-content">
                <div className="memory-reader-kicker">
                  <span>REFLECTION / {new Date(selectedMemory.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</span>
                  {selectedMemory.tag && <span className="memory-reader-tag">{selectedMemory.tag}</span>}
                </div>

                <h1 id="memory-reader-title" className="memory-reader-title">{selectedMemory.title}</h1>

                <div className="memory-reader-context">
                  {selectedMemory.location && (
                    <span><MapPin size={14} /> {selectedMemory.location.lat.toFixed(3)}, {selectedMemory.location.lng.toFixed(3)}</span>
                  )}
                  {selectedMemory.sessionStartTime && <span>Started {selectedMemory.sessionStartTime}</span>}
                  {selectedMemory.sessionEndTime && <span>Ended {selectedMemory.sessionEndTime}</span>}
                </div>

                <div className="memory-reader-body">{selectedMemory.content}</div>

                {selectedMemory.history && selectedMemory.history.length > 0 && (
                  <section className="memory-reader-history" aria-label="Revision history">
                    <div className="memory-reader-history-heading">
                      <h2>Earlier versions</h2>
                      <span>{selectedMemory.history.length} revisions</span>
                    </div>
                    <div className="memory-revision-list">
                      {selectedMemory.history.map((rev, idx) => (
                        <details key={idx} className="memory-revision">
                          <summary>
                            <span>{rev.title}</span>
                            <time>{new Date(rev.editedAt).toLocaleString()}</time>
                          </summary>
                          <p>{rev.content}</p>
                        </details>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            </motion.section>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
