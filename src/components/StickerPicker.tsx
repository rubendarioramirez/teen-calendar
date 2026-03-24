import { STICKER_IMAGES } from '../stickers';
import { theme } from '../theme';

type Props = {
  selectedSticker: string | null;
  onSelect: (src: string | null) => void;
};

export function StickerPicker({ selectedSticker, onSelect }: Props) {
  return (
    <div className="flex items-center gap-2">
      {STICKER_IMAGES.map((src) => (
        <button
          key={src}
          onClick={() => onSelect(selectedSticker === src ? null : src)}
          title="Place sticker"
          className="transition-transform hover:scale-110 active:scale-95"
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            overflow: 'hidden',
            border: selectedSticker === src
              ? '3px solid white'
              : '2px solid rgba(255,255,255,0.25)',
            boxShadow: selectedSticker === src
              ? '0 0 10px rgba(255,255,255,0.5)'
              : '0 2px 6px rgba(0,0,0,0.3)',
            flexShrink: 0,
          }}
        >
          <img
            src={src}
            alt="sticker"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </button>
      ))}
    </div>
  );
}
