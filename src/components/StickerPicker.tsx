import { useRef, useState, useEffect } from 'react';
import { Plus, Layers } from 'lucide-react';
import { STICKER_IMAGES } from '../stickers';
import { useTheme } from '../theme';
import { removeWhiteBg } from '../utils/removeWhiteBg';

const CUSTOM_KEY = 'matilda_custom_stickers';

function loadCustom(): string[] {
  try { return JSON.parse(localStorage.getItem(CUSTOM_KEY) ?? '[]'); }
  catch { return []; }
}

type Props = {
  selectedSticker: string | null;
  onSelect: (src: string | null) => void;
};

export function StickerPicker({ selectedSticker, onSelect }: Props) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState<string[]>(loadCustom);
  const [processedSrcs, setProcessedSrcs] = useState<Record<string, string>>({});
  const submittedSrcs = useRef(new Set<string>());
  const panelRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const all = [...STICKER_IMAGES, ...custom];

  // Process white backgrounds for thumbnails
  useEffect(() => {
    for (const src of all) {
      if (!submittedSrcs.current.has(src)) {
        submittedSrcs.current.add(src);
        removeWhiteBg(src).then((result) => {
          setProcessedSrcs((prev) => ({ ...prev, [src]: result }));
        });
      }
    }
  }, [all.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleSelect = (src: string) => {
    onSelect(selectedSticker === src ? null : src);
    setOpen(false);
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      const next = [...custom, dataUrl];
      setCustom(next);
      localStorage.setItem(CUSTOM_KEY, JSON.stringify(next));
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div ref={panelRef} className="relative">
      {/* Trigger button */}
      <button
        onClick={() => setOpen((v) => !v)}
        title="Stickers"
        className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all hover:scale-105 active:scale-95"
        style={{
          border: open || selectedSticker
            ? `2px solid ${theme.accent}`
            : '2px solid rgba(255,255,255,0.2)',
          backgroundColor: open || selectedSticker
            ? `${theme.accent}22`
            : 'rgba(255,255,255,0.05)',
          color: open || selectedSticker ? theme.accent : theme.textSecondary,
        }}
      >
        <Layers size={16} />
        <span className="text-sm font-semibold">Stickers</span>
        {selectedSticker && (
          <img
            src={processedSrcs[selectedSticker] ?? selectedSticker}
            className="w-5 h-5 rounded-md object-contain"
          />
        )}
      </button>

      {/* Panel */}
      {open && (
        <div
          className="absolute right-0 top-12 z-50 rounded-2xl shadow-2xl overflow-hidden"
          style={{
            backgroundColor: theme.modalBg,
            border: `1px solid ${theme.cellBorder}`,
            backdropFilter: 'blur(16px)',
            minWidth: 220,
          }}
        >
          <div className="px-4 pt-3 pb-1">
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: theme.textSecondary }}>
              Choose a sticker
            </p>
          </div>

          <div className="p-3 grid grid-cols-4 gap-2">
            {all.map((src) => (
              <button
                key={src}
                onClick={() => handleSelect(src)}
                className="transition-all hover:scale-110 active:scale-95 relative group"
                title="Place sticker"
              >
                <img
                  src={processedSrcs[src] ?? src}
                  alt="sticker"
                  className="w-12 h-12 object-contain rounded-xl"
                  style={{
                    border: selectedSticker === src
                      ? `3px solid ${theme.accent}`
                      : '2px solid rgba(255,255,255,0.15)',
                    boxShadow: selectedSticker === src
                      ? `0 0 12px ${theme.accent}88`
                      : '0 2px 8px rgba(0,0,0,0.4)',
                  }}
                />
                {selectedSticker === src && (
                  <div
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black"
                    style={{ backgroundColor: theme.accent, color: theme.bg }}
                  >
                    ✓
                  </div>
                )}
              </button>
            ))}

            {/* Add new sticker */}
            <button
              onClick={() => fileRef.current?.click()}
              title="Add sticker image"
              className="w-12 h-12 rounded-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95"
              style={{
                border: `2px dashed ${theme.accent}88`,
                backgroundColor: `${theme.accent}11`,
                color: theme.accent,
              }}
            >
              <Plus size={20} />
            </button>
          </div>

          <div className="px-4 pb-3">
            <p className="text-[10px]" style={{ color: theme.textSecondary }}>
              Tap a sticker, then click anywhere on the calendar
            </p>
          </div>
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleUpload}
      />
    </div>
  );
}
