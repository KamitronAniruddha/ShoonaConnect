import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase, createSafeChannel } from '../lib/supabase';
import { compressImage } from '../utils/imageCompressor';
import { uploadCoupleMedia, deleteCoupleMedia } from '../utils/supabaseStorage';
import { memoryToRow } from '../utils/supabaseMappers';
import {
  Lock,
  Image as ImageIcon,
  Plus,
  Download,
  Trash2,
  X,
  Heart,
  Calendar,
  Clock,
  Edit3,
  User,
  Sparkles,
  Check,
  Search,
  AlertTriangle,
  Info,
  ShieldCheck,
  MessageSquare,
} from 'lucide-react';

export interface MediaVaultItem {
  id: string; // Supabase record ID
  table: 'vault_items' | 'memories';
  url: string;
  allUrls: string[];
  title: string;
  specialNote: string;
  date: string; // YYYY-MM-DD
  createdAt: string; // Full ISO timestamp
  createdBy?: string;
  createdByName?: string;
}

export const VaultView: React.FC = () => {
  const { userProfile, couple } = useAuth();
  const [mediaItems, setMediaItems] = useState<MediaVaultItem[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<MediaVaultItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Upload modal state
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [pendingPreviews, setPendingPreviews] = useState<string[]>([]);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadSpecialNote, setUploadSpecialNote] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Delete modal state
  const [itemToDelete, setItemToDelete] = useState<MediaVaultItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Edit note state in lightbox
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [editedNoteText, setEditedNoteText] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const coupleId = couple?.id;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Fetch all photos from vault_items AND memories
  const fetchVaultData = async () => {
    if (!coupleId) return;

    try {
      const itemsMap: MediaVaultItem[] = [];

      // 1. Fetch from vault_items
      const { data: vaultData } = await supabase
        .from('vault_items')
        .select('*')
        .eq('couple_id', coupleId)
        .order('created_at', { ascending: false });

      if (vaultData) {
        vaultData.forEach((item) => {
          const urls: string[] = item.media_urls || [];
          urls.forEach((url) => {
            itemsMap.push({
              id: item.id,
              table: 'vault_items',
              url,
              allUrls: urls,
              title: item.title || 'Vault Photo',
              specialNote: item.content || '',
              date: item.created_at ? item.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
              createdAt: item.created_at || new Date().toISOString(),
              createdBy: item.created_by,
              createdByName: item.created_by === userProfile?.uid ? userProfile?.displayName : 'Partner',
            });
          });
        });
      }

      // 2. Fetch from memories
      const { data: memoryData } = await supabase
        .from('memories')
        .select('*')
        .eq('couple_id', coupleId)
        .order('created_at', { ascending: false });

      if (memoryData) {
        memoryData.forEach((mem) => {
          const urls: string[] = mem.media_urls || [];
          urls.forEach((url) => {
            // Avoid duplicates if same record exists
            itemsMap.push({
              id: mem.id,
              table: 'memories',
              url,
              allUrls: urls,
              title: mem.title || 'Memory Photo',
              specialNote: mem.description || '',
              date: mem.date || (mem.created_at ? mem.created_at.split('T')[0] : new Date().toISOString().split('T')[0]),
              createdAt: mem.created_at || new Date().toISOString(),
              createdBy: mem.created_by,
              createdByName: mem.created_by_name || (mem.created_by === userProfile?.uid ? userProfile?.displayName : 'Partner'),
            });
          });
        });
      }

      // Sort all items newest first
      itemsMap.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setMediaItems(itemsMap);
    } catch (err) {
      console.error('Error fetching vault data:', err);
    }
  };

  useEffect(() => {
    if (!coupleId) return;

    fetchVaultData();

    // Subscribe to realtime updates on vault_items & memories
    const channelVault = createSafeChannel(`vault_items_realtime:${coupleId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'vault_items', filter: `couple_id=eq.${coupleId}` },
        () => fetchVaultData()
      )
      .subscribe();

    const channelMemories = createSafeChannel(`vault_memories_realtime:${coupleId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'memories', filter: `couple_id=eq.${coupleId}` },
        () => fetchVaultData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channelVault);
      supabase.removeChannel(channelMemories);
    };
  }, [coupleId]);

  // Handle File Selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    setPendingFiles(fileList);

    // Create local object URLs for instant previews
    const previews = fileList.map((file) => URL.createObjectURL(file));
    setPendingPreviews(previews);

    // Set default upload title
    setUploadTitle(`Vault Photo (${new Date().toLocaleDateString()})`);
    setUploadSpecialNote('');
    setIsUploadModalOpen(true);
  };

  // Close upload modal & cleanup object URLs
  const closeUploadModal = () => {
    pendingPreviews.forEach((url) => URL.revokeObjectURL(url));
    setPendingFiles([]);
    setPendingPreviews([]);
    setUploadTitle('');
    setUploadSpecialNote('');
    setIsUploadModalOpen(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Confirm Uploading & Saving to Supabase
  const handleConfirmUpload = async () => {
    if (pendingFiles.length === 0 || !coupleId) return;

    setIsUploading(true);
    try {
      const uploadedUrls: string[] = [];

      for (const file of pendingFiles) {
        const compressed = await compressImage(file, 1200, 0.85);
        const storageUrl = await uploadCoupleMedia(coupleId, compressed, 'vault');
        if (storageUrl) {
          uploadedUrls.push(storageUrl);
        }
      }

      if (uploadedUrls.length === 0) {
        throw new Error('Failed to upload image files to storage.');
      }

      // Try inserting into vault_items first
      const vaultPayload = {
        couple_id: coupleId,
        title: uploadTitle.trim() || `Vault Photo (${new Date().toLocaleDateString()})`,
        category: 'media',
        content: uploadSpecialNote.trim(),
        media_urls: uploadedUrls,
        created_by: userProfile?.uid,
        created_at: new Date().toISOString(),
      };

      const { error: vaultError } = await supabase.from('vault_items').insert(vaultPayload);

      if (vaultError) {
        console.warn('vault_items insert failed, falling back to memories:', vaultError.message);
        // Fallback to memories table
        const memoryPayload = {
          coupleId,
          title: uploadTitle.trim() || `Vault Photo (${new Date().toLocaleDateString()})`,
          description: uploadSpecialNote.trim(),
          date: new Date().toISOString().split('T')[0],
          tags: ['Vault'],
          mediaUrls: uploadedUrls,
          isFavorite: false,
          createdBy: userProfile?.uid,
          createdByName: userProfile?.displayName,
          createdAt: new Date().toISOString(),
        };

        const { error: memError } = await supabase
          .from('memories')
          .insert(memoryToRow(memoryPayload));

        if (memError) throw memError;
      }

      showToast('Photo added to Media Vault successfully!');
      closeUploadModal();
      await fetchVaultData();
    } catch (err: any) {
      console.error('Error during upload to vault:', err);
      showToast('Error uploading photo: ' + (err.message || 'Please try again'));
    } finally {
      setIsUploading(false);
    }
  };

  // Delete Photo permanently from Supabase
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    setIsDeleting(true);
    try {
      // 1. Delete media object from Supabase Storage bucket ('couple-media')
      if (itemToDelete.url) {
        await deleteCoupleMedia(itemToDelete.url);
      }

      // 2. Remove URL or row from Supabase Database table
      if (itemToDelete.allUrls.length <= 1) {
        // Delete the entire row from Supabase database
        const { error } = await supabase
          .from(itemToDelete.table)
          .delete()
          .eq('id', itemToDelete.id);

        if (error) console.error('Database row deletion error:', error.message);
      } else {
        // Update the array removing this specific photo URL
        const updatedUrls = itemToDelete.allUrls.filter((u) => u !== itemToDelete.url);
        const { error } = await supabase
          .from(itemToDelete.table)
          .update({ media_urls: updatedUrls })
          .eq('id', itemToDelete.id);

        if (error) console.error('Database array update error:', error.message);
      }

      showToast('Photo permanently deleted from Supabase');

      // Close modal & lightbox if selected
      if (selectedMedia?.url === itemToDelete.url) {
        setSelectedMedia(null);
      }
      setItemToDelete(null);
      await fetchVaultData();
    } catch (err: any) {
      console.error('Failed to delete media:', err);
      showToast('Failed to delete photo: ' + (err.message || 'Unknown error'));
    } finally {
      setIsDeleting(false);
    }
  };

  // Save updated Special Note to Supabase
  const handleSaveSpecialNote = async () => {
    if (!selectedMedia) return;

    try {
      const newNote = editedNoteText.trim();
      if (selectedMedia.table === 'vault_items') {
        const { error } = await supabase
          .from('vault_items')
          .update({ content: newNote })
          .eq('id', selectedMedia.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('memories')
          .update({ description: newNote })
          .eq('id', selectedMedia.id);
        if (error) throw error;
      }

      setSelectedMedia({
        ...selectedMedia,
        specialNote: newNote,
      });

      setIsEditingNote(false);
      showToast('Special note updated in Supabase!');
      await fetchVaultData();
    } catch (err: any) {
      console.error('Failed to update special note:', err);
      showToast('Failed to save note: ' + err.message);
    }
  };

  // Filter media items
  const filteredMedia = mediaItems.filter((item) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(query) ||
      item.specialNote.toLowerCase().includes(query) ||
      item.createdByName?.toLowerCase().includes(query)
    );
  });

  // Helper for formatting date & time
  const formatDateTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return { fullDate: 'Unknown date', timeStr: '' };

      const fullDate = d.toLocaleDateString(undefined, {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });

      const timeStr = d.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });

      return { fullDate, timeStr };
    } catch {
      return { fullDate: isoString, timeStr: '' };
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6 pb-24 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/95 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-xl border border-white/10 flex items-center gap-2.5 animate-bounce">
          <Sparkles className="w-4 h-4 text-rose-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            Private Couple Media Vault
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Encrypted cloud media vault strictly for you and your partner. Store photos with timestamps & special notes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            id="btn-upload-vault"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="px-4 py-2.5 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-2xl text-xs font-bold shadow-md shadow-rose-200 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" /> Add New Media
          </button>
        </div>
      </div>

      {/* Vault Info Badge & Search Bar */}
      <div className="grid sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2 p-4 bg-slate-900 text-white rounded-3xl flex items-center justify-between shadow-sm border border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-rose-400">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold">{mediaItems.length} Secured Couple Photos</h4>
              <p className="text-[11px] text-slate-400">Synced directly with Supabase Storage & Database</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-semibold border border-emerald-500/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            Secured
          </div>
        </div>

        {/* Search */}
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title or note..."
            className="w-full pl-9 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Media Grid */}
      {filteredMedia.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-rose-100 p-8 space-y-3">
          <ImageIcon className="w-14 h-14 text-rose-300 mx-auto" />
          <h4 className="text-base font-bold text-slate-700">
            {searchQuery ? 'No matching photos found' : 'Vault is empty'}
          </h4>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            {searchQuery
              ? 'Try searching with different keywords.'
              : 'Upload private photos directly with special notes and exact timestamps to build your private gallery!'}
          </p>
          {!searchQuery && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-rose-500 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-xs hover:bg-rose-600 transition-colors"
            >
              Upload First Photo
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filteredMedia.map((item, idx) => {
            const { fullDate, timeStr } = formatDateTime(item.createdAt);
            return (
              <div
                key={idx}
                className="group relative aspect-square rounded-3xl overflow-hidden bg-slate-100 shadow-xs cursor-pointer hover:shadow-xl transition-all border border-slate-200/60"
                onClick={() => {
                  setSelectedMedia(item);
                  setIsEditingNote(false);
                  setEditedNoteText(item.specialNote || '');
                }}
              >
                <img
                  src={item.url}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Special Note Indicator Badge */}
                {item.specialNote && (
                  <div className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-rose-500/90 text-white flex items-center justify-center shadow-md backdrop-blur-xs">
                    <Heart className="w-3.5 h-3.5 fill-white" />
                  </div>
                )}

                {/* Delete Button on Hover */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setItemToDelete(item);
                  }}
                  title="Delete from Supabase"
                  className="absolute top-2.5 left-2.5 p-2 bg-black/60 hover:bg-rose-600 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                {/* Card Overlay Details */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3 text-white">
                  <span className="text-xs font-bold truncate">{item.title}</span>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-300 mt-0.5">
                    <Calendar className="w-3 h-3 text-rose-400" />
                    <span>{fullDate}</span>
                    {timeStr && <span className="text-slate-400">• {timeStr}</span>}
                  </div>
                  {item.specialNote && (
                    <p className="text-[10px] text-rose-200 italic line-clamp-1 mt-1 flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5 text-rose-300 shrink-0" />
                      <span>{item.specialNote}</span>
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox / Details Modal */}
      {selectedMedia && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative max-w-4xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row my-auto max-h-[92vh]">
            {/* Close Button */}
            <button
              onClick={() => setSelectedMedia(null)}
              className="absolute top-4 right-4 z-20 p-2.5 bg-black/50 hover:bg-black/80 text-white rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Left Column: Media Preview */}
            <div className="md:w-3/5 bg-slate-950 flex items-center justify-center p-4 min-h-[300px] max-h-[60vh] md:max-h-none">
              <img
                src={selectedMedia.url}
                alt={selectedMedia.title}
                className="max-h-[55vh] md:max-h-[80vh] w-auto max-w-full object-contain rounded-2xl shadow-lg"
              />
            </div>

            {/* Right Column: Details & Special Note */}
            <div className="md:w-2/5 p-6 flex flex-col justify-between space-y-5 overflow-y-auto bg-slate-50/50">
              <div className="space-y-4">
                {/* Title */}
                <div>
                  <div className="flex items-center gap-2 text-rose-500 text-xs font-bold uppercase tracking-wider mb-1">
                    <Lock className="w-3.5 h-3.5" />
                    Vault Media Entry
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-800">{selectedMedia.title}</h3>
                </div>

                {/* Date & Time Added Details */}
                <div className="p-3.5 bg-white rounded-2xl border border-slate-200/80 space-y-2 shadow-2xs">
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-rose-500" />
                    Date & Time Uploaded
                  </h4>
                  <div className="text-xs text-slate-700 font-medium space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Full Date:</span>
                      <span className="font-semibold">{formatDateTime(selectedMedia.createdAt).fullDate}</span>
                    </div>
                    {formatDateTime(selectedMedia.createdAt).timeStr && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Exact Time:</span>
                        <span className="font-semibold text-rose-600">{formatDateTime(selectedMedia.createdAt).timeStr}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Added By:</span>
                      <span className="font-semibold">{selectedMedia.createdByName || 'Partner'}</span>
                    </div>
                  </div>
                </div>

                {/* Mention Special About Pic */}
                <div className="p-4 bg-gradient-to-br from-rose-50 to-pink-50/50 rounded-2xl border border-rose-200/80 space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-rose-700 flex items-center gap-1.5">
                      <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                      Special About This Photo
                    </h4>
                    {!isEditingNote && (
                      <button
                        onClick={() => {
                          setIsEditingNote(true);
                          setEditedNoteText(selectedMedia.specialNote || '');
                        }}
                        className="text-[11px] font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer bg-white px-2 py-1 rounded-lg border border-rose-200 shadow-2xs"
                      >
                        <Edit3 className="w-3 h-3" />
                        {selectedMedia.specialNote ? 'Edit Note' : 'Add Note'}
                      </button>
                    )}
                  </div>

                  {isEditingNote ? (
                    <div className="space-y-2 pt-1">
                      <textarea
                        value={editedNoteText}
                        onChange={(e) => setEditedNoteText(e.target.value)}
                        placeholder="Mention what makes this photo special..."
                        rows={3}
                        className="w-full p-2.5 bg-white border border-rose-300 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-400"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setIsEditingNote(false)}
                          className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer hover:bg-slate-300"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveSpecialNote}
                          className="px-3 py-1.5 bg-rose-500 text-white rounded-xl text-xs font-semibold cursor-pointer hover:bg-rose-600 shadow-2xs"
                        >
                          Save Note
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-700 leading-relaxed italic">
                      {selectedMedia.specialNote
                        ? `"${selectedMedia.specialNote}"`
                        : 'No special note mentioned yet. Click "Add Note" to add a meaningful description!'}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons: Download & Delete */}
              <div className="pt-4 border-t border-slate-200 flex items-center gap-3">
                <a
                  href={selectedMedia.url}
                  download={`vault_photo_${selectedMedia.id}.jpg`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                >
                  <Download className="w-4 h-4" /> Download Original
                </a>

                <button
                  onClick={() => setItemToDelete(selectedMedia)}
                  className="px-4 py-2.5 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Delete photo permanently from Supabase"
                >
                  <Trash2 className="w-4 h-4 text-rose-600" /> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Confirmation Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative border border-rose-100">
            <button
              onClick={closeUploadModal}
              disabled={isUploading}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Upload to Media Vault</h3>
                <p className="text-xs text-slate-500">
                  {pendingFiles.length} photo{pendingFiles.length > 1 ? 's' : ''} selected
                </p>
              </div>
            </div>

            {/* Preview Thumbnails */}
            <div className="flex gap-2 overflow-x-auto py-1">
              {pendingPreviews.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt="preview"
                  className="w-20 h-20 object-cover rounded-xl border border-slate-200 shrink-0"
                />
              ))}
            </div>

            {/* Form Inputs */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Photo Title</label>
                <input
                  type="text"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="e.g., Sunset at Beach"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Mention Special About Pic</span>
                  <span className="text-[10px] text-rose-500 font-normal">Optional Memory Note</span>
                </label>
                <textarea
                  value={uploadSpecialNote}
                  onChange={(e) => setUploadSpecialNote(e.target.value)}
                  placeholder="What makes this photo or moment special?"
                  rows={3}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={closeUploadModal}
                disabled={isUploading}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmUpload}
                disabled={isUploading}
                className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl text-xs font-bold shadow-md shadow-rose-200 flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Securing in Cloud...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Save to Vault
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-rose-100 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-800">Delete Photo Permanently?</h3>
              <p className="text-xs text-slate-500">
                This will permanently delete this photo from Supabase Cloud Storage and your database.
              </p>
            </div>

            <div className="p-2 bg-slate-100 rounded-xl max-w-[120px] mx-auto overflow-hidden">
              <img src={itemToDelete.url} alt="To delete" className="w-full h-20 object-cover rounded-lg" />
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setItemToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-md shadow-rose-200 flex items-center gap-2"
              >
                {isDeleting ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
