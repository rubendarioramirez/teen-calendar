import { EVENT_ICONS } from '../eventIcons';
import { useTheme } from '../theme';

type Props = {
  selected: string;
  onSelect: (emoji: string) => void;
};

export function IconPicker({ selected, onSelect }: Props) {
  const theme = useTheme();
  return (
    <div>
      <label className="block text-sm font-medium mb-2" style={{ color: theme.textSecondary }}>
        Icon
      </label>
      <div className="flex flex-wrap gap-1.5">
        {/* No icon option */}
        <button
          type="button"
          onClick={() => onSelect('')}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-xs transition-all hover:scale-110"
          style={{
            border: selected === '' ? '2px solid white' : '2px solid rgba(255,255,255,0.15)',
            backgroundColor: selected === '' ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)',
            color: theme.textSecondary,
          }}
          title="No icon"
        >
          —
        </button>

        {EVENT_ICONS.map(({ emoji, label }) => (
          <button
            key={emoji}
            type="button"
            onClick={() => onSelect(selected === emoji ? '' : emoji)}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-lg transition-all hover:scale-110"
            style={{
              border: selected === emoji ? '2px solid white' : '2px solid rgba(255,255,255,0.15)',
              backgroundColor: selected === emoji ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)',
              boxShadow: selected === emoji ? '0 0 8px rgba(255,255,255,0.3)' : 'none',
            }}
            title={label}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
