import { useRef, useState, useEffect } from 'react';
import { Rnd } from 'react-rnd';
import { Trash2 } from 'lucide-react';
import type { PlacedSticker } from '../types';
import { removeWhiteBg } from '../utils/removeWhiteBg';

type Props = {
  stickers: PlacedSticker[];
  onMove: (id: string, x: number, y: number) => void;
  onRemove: (id: string) => void;
  onDragStart: () => void;
};

export function StickerLayer({ stickers, onMove, onRemove, onDragStart }: Props) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [processedSrcs, setProcessedSrcs] = useState<Record<string, string>>({});
  const submittedSrcs = useRef(new Set<string>());
  const trashRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    for (const sticker of stickers) {
      if (!submittedSrcs.current.has(sticker.src)) {
        submittedSrcs.current.add(sticker.src);
        removeWhiteBg(sticker.src).then((result) => {
          setProcessedSrcs((prev) => ({ ...prev, [sticker.src]: result }));
        });
      }
    }
  }, [stickers]);

  const handleDragStart = (id: string) => {
    setDraggingId(id);
    onDragStart();
  };

  const handleDragStop = (id: string, e: MouseEvent | TouchEvent, d: { x: number; y: number }) => {
    setDraggingId(null);

    if (trashRef.current) {
      const rect = trashRef.current.getBoundingClientRect();
      const clientX = 'touches' in e ? (e as TouchEvent).changedTouches[0].clientX : (e as MouseEvent).clientX;
      const clientY = 'touches' in e ? (e as TouchEvent).changedTouches[0].clientY : (e as MouseEvent).clientY;

      if (clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom) {
        onRemove(id);
        return;
      }
    }

    onMove(id, d.x, d.y);
  };

  return (
    <>
      {/* Trash bin — visible in bottom-right, glows red while dragging */}
      <div
        ref={trashRef}
        style={{
          position: 'absolute',
          right: 24,
          bottom: 100,
          width: 60,
          height: 60,
          zIndex: 30,
          borderRadius: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          transition: 'all 0.2s',
          opacity: draggingId ? 1 : 0.25,
          backgroundColor: draggingId ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.05)',
          border: draggingId ? '2px dashed #ef4444' : '2px dashed rgba(255,255,255,0.2)',
          transform: draggingId ? 'scale(1.15)' : 'scale(1)',
        }}
      >
        <Trash2 size={26} color={draggingId ? '#ef4444' : '#9294E4'} />
      </div>

      {stickers.map((sticker) => (
        <Rnd
          key={sticker.id}
          position={{ x: sticker.x, y: sticker.y }}
          size={{ width: sticker.size, height: sticker.size }}
          onDragStart={() => handleDragStart(sticker.id)}
          onDragStop={(e, d) => handleDragStop(sticker.id, e as unknown as MouseEvent, d)}
          enableResizing={false}
          style={{ zIndex: 20 }}
        >
          {/* sticker-bounce plays the drop-in animation once on mount */}
          <div
            className={`sticker-bounce${draggingId === sticker.id ? ' sticker-peeling' : ''}`}
            onClick={(e) => e.stopPropagation()}
            style={{ width: '100%', height: '100%' }}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                transform: `rotate(${sticker.rotation}deg)`,
                cursor: 'grab',
                filter:
                  'drop-shadow(0 0 4px rgba(255,255,255,0.6)) drop-shadow(2px 4px 8px rgba(0,0,0,0.4))',
              }}
            >
              {/* sticker-inner holds the peel ::after pseudo-element */}
              <div className="sticker-inner">
                <img
                  src={processedSrcs[sticker.src] ?? sticker.src}
                  alt="sticker"
                  draggable={false}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    borderRadius: 8,
                    userSelect: 'none',
                  }}
                />
              </div>
            </div>
          </div>
        </Rnd>
      ))}
    </>
  );
}
