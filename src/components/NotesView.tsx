import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { SharedNote, NoteItem } from '../types';
import { supabase } from '../lib/supabase';
import { noteRowToSharedNote, noteToRow } from '../utils/supabaseMappers';
import {
  FileText,
  Plus,
  Pin,
  Trash2,
  CheckSquare,
  Square,
  X,
  Edit2,
  Tag,
  Sparkles,
} from 'lucide-react';

const COLOR_OPTIONS = [
  { id: 'rose', bg: 'bg-rose-50 border-rose-200 text-rose-900', dot: 'bg-rose-400' },
  { id: 'amber', bg: 'bg-amber-50 border-amber-200 text-amber-900', dot: 'bg-amber-400' },
  { id: 'emerald', bg: 'bg-emerald-50 border-emerald-200 text-emerald-900', dot: 'bg-emerald-400' },
  { id: 'blue', bg: 'bg-blue-50 border-blue-200 text-blue-900', dot: 'bg-blue-400' },
  { id: 'purple', bg: 'bg-purple-50 border-purple-200 text-purple-900', dot: 'bg-purple-400' },
];

export const NotesView: React.FC = () => {
  const { userProfile, couple } = useAuth();
  const [notes, setNotes] = useState<SharedNote[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<SharedNote | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('list');
  const [color, setColor] = useState('rose');
  const [isChecklist, setIsChecklist] = useState(false);
  const [checklistItems, setChecklistItems] = useState<string[]>(['']);
  const [saving, setSaving] = useState(false);

  const coupleId = couple?.id;

  // Listen to shared notes
  useEffect(() => {
    if (!coupleId) return;

    const fetchNotes = async () => {
      const { data, error } = await supabase
        .from('shared_notes')
        .select('*')
        .eq('couple_id', coupleId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setNotes(data.map(noteRowToSharedNote));
      }
    };

    fetchNotes();

    const channel = supabase
      .channel(`shared_notes:${coupleId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'shared_notes',
          filter: `couple_id=eq.${coupleId}`,
        },
        () => {
          fetchNotes();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [coupleId]);

  const openAddModal = () => {
    setEditingNote(null);
    setTitle('');
    setContent('');
    setCategory('list');
    setColor('rose');
    setIsChecklist(false);
    setChecklistItems(['']);
    setIsModalOpen(true);
  };

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coupleId || !title.trim() || !userProfile?.uid) return;

    setSaving(true);
    const formattedChecklist: NoteItem[] = isChecklist
      ? checklistItems
          .filter((t) => t.trim())
          .map((text, idx) => ({ id: `item_${idx}_${Date.now()}`, text: text.trim(), completed: false }))
      : [];

    try {
      if (editingNote) {
        const payload = {
          title: title.trim(),
          content: content.trim(),
          category,
          color,
          updated_at: new Date().toISOString(),
          updated_by: userProfile.uid,
        };
        const { error } = await supabase
          .from('shared_notes')
          .update(payload)
          .eq('id', editingNote.id)
          .eq('couple_id', coupleId);
        if (error) throw error;
      } else {
        const payload: Partial<SharedNote> = {
          coupleId,
          title: title.trim(),
          content: content.trim(),
          category,
          color,
          isPinned: false,
          items: formattedChecklist,
          createdBy: userProfile.uid,
          createdByName: userProfile.displayName,
          updatedBy: userProfile.uid,
          updatedByName: userProfile.displayName,
          createdAt: new Date().toISOString(),
        };
        const { error } = await supabase
          .from('shared_notes')
          .insert(noteToRow(payload));
        if (error) throw error;
      }

      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving note:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleChecklistItem = async (note: SharedNote, itemId: string) => {
    if (!coupleId || !note.items || !userProfile?.uid) return;
    const updated = note.items.map((it) =>
      it.id === itemId ? { ...it, completed: !it.completed } : it
    );
    try {
      await supabase
        .from('shared_notes')
        .update({
          items: updated,
          updated_at: new Date().toISOString(),
          updated_by: userProfile.uid,
        })
        .eq('id', note.id)
        .eq('couple_id', coupleId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleTogglePin = async (note: SharedNote) => {
    if (!coupleId || !userProfile?.uid) return;
    try {
      await supabase
        .from('shared_notes')
        .update({
          is_pinned: !note.isPinned,
          updated_at: new Date().toISOString(),
          updated_by: userProfile.uid,
        })
        .eq('id', note.id)
        .eq('couple_id', coupleId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!coupleId) return;
    if (!confirm('Delete this shared note?')) return;
    try {
      await supabase
        .from('shared_notes')
        .delete()
        .eq('id', id)
        .eq('couple_id', coupleId);
    } catch (err) {
      console.error(err);
    }
  };

  // Sort pinned first
  const sortedNotes = [...notes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return 0;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <FileText className="w-6 h-6 text-rose-500" />
            Shared Notes & Lists
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Groceries, trip itineraries, movie watchlists, and sweet reminders.
          </p>
        </div>

        <button
          id="btn-add-note"
          onClick={openAddModal}
          className="px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl text-xs font-semibold shadow-sm shadow-rose-200 flex items-center gap-2 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Note / List
        </button>
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {sortedNotes.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-white rounded-3xl border border-rose-100 p-8 space-y-3">
            <FileText className="w-12 h-12 text-rose-300 mx-auto" />
            <h4 className="text-base font-bold text-slate-700">No notes created yet</h4>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Create a checklist for your next trip, or a grocery list for tonight’s dinner!
            </p>
            <button
              onClick={openAddModal}
              className="px-4 py-2 bg-rose-500 text-white rounded-xl text-xs font-semibold cursor-pointer"
            >
              Create First Shared Note
            </button>
          </div>
        ) : (
          sortedNotes.map((note) => {
            const colorScheme = COLOR_OPTIONS.find((c) => c.id === note.color) || COLOR_OPTIONS[0];

            return (
              <div
                key={note.id}
                className={`rounded-3xl p-5 border shadow-xs hover:shadow-md transition-all flex flex-col justify-between group ${colorScheme.bg}`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-bold text-slate-800 line-clamp-1">{note.title}</h4>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleTogglePin(note)}
                        className={`p-1 rounded-md transition-colors cursor-pointer ${
                          note.isPinned ? 'text-rose-600' : 'text-slate-400 hover:text-slate-600'
                        }`}
                        title="Pin Note"
                      >
                        <Pin className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(note.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 rounded-md transition-opacity cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Text content if plain note */}
                  {note.content && (
                    <p className="text-xs text-slate-700 mt-2 leading-relaxed whitespace-pre-wrap">
                      {note.content}
                    </p>
                  )}

                  {/* Checklist items if checklist */}
                  {note.items && note.items.length > 0 && (
                    <div className="space-y-1.5 mt-3">
                      {note.items.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => handleToggleChecklistItem(note, item.id)}
                          className="flex items-center gap-2 text-xs cursor-pointer group/item select-none"
                        >
                          {item.completed ? (
                            <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400 group-hover/item:text-slate-600 shrink-0" />
                          )}
                          <span
                            className={item.completed ? 'line-through text-slate-400' : 'text-slate-800'}
                          >
                            {item.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-3 mt-4 border-t border-black/5 flex items-center justify-between text-[10px] text-slate-400">
                  <span>Updated {new Date(note.updatedAt || note.createdAt).toLocaleDateString()}</span>
                  <span className="capitalize">{note.category}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Note Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-rose-100 p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800">New Shared Note</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNote} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Title *</label>
                <input
                  id="note-title-input"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Weekend Getaway Packing List"
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>

              {/* Checklist Toggle */}
              <div className="flex items-center gap-4 text-xs font-semibold text-slate-700">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="notetype"
                    checked={!isChecklist}
                    onChange={() => setIsChecklist(false)}
                  />
                  Regular Note
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="notetype"
                    checked={isChecklist}
                    onChange={() => setIsChecklist(true)}
                  />
                  Interactive Checklist
                </label>
              </div>

              {!isChecklist ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Content</label>
                  <textarea
                    id="note-content-input"
                    rows={4}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write ideas, notes, or messages..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-700">Checklist Items</label>
                  {checklistItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => {
                          const copy = [...checklistItems];
                          copy[idx] = e.target.value;
                          setChecklistItems(copy);
                        }}
                        placeholder={`Item ${idx + 1}`}
                        className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400"
                      />
                      {checklistItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            setChecklistItems(checklistItems.filter((_, i) => i !== idx))
                          }
                          className="text-slate-400 hover:text-red-500"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setChecklistItems([...checklistItems, ''])}
                    className="text-xs font-semibold text-rose-500 hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add another item
                  </button>
                </div>
              )}

              {/* Color picker */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Note Color</label>
                <div className="flex gap-2">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setColor(c.id)}
                      className={`w-7 h-7 rounded-full ${c.dot} cursor-pointer transition-transform ${
                        color === c.id ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : ''
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="btn-save-note"
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold shadow-xs shadow-rose-200 flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
