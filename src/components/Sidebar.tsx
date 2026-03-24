import { format } from 'date-fns';
import type { Event } from '../types';
import { useTheme } from '../theme';

type Props = {
  events: Event[];
  onEditEvent: (event: Event) => void;
  showSchool: boolean;
  onToggleSchool: () => void;
  selectedColor: string | null;
  bgColor: string;
  onColorClick: () => void;
};

const DAY_ORDER = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function groupByDay(events: Event[]): { day: string; events: Event[] }[] {
  const map: Record<string, Event[]> = {};
  for (const event of events) {
    const day = format(event.date, 'EEEE');
    if (!map[day]) map[day] = [];
    map[day].push(event);
  }
  return Object.entries(map)
    .sort(([a], [b]) => DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b))
    .map(([day, events]) => ({ day, events }));
}

export function Sidebar({ events, onEditEvent, showSchool, onToggleSchool, selectedColor, bgColor, onColorClick }: Props) {
  const theme = useTheme();
  const grouped = groupByDay(events);

  return (
    <aside
      className="w-64 flex-shrink-0 flex flex-col border-r backdrop-blur-md h-full transition-colors"
      style={{
        backgroundColor: bgColor || theme.sidebarBg,
        borderColor: theme.cellBorder,
        cursor: selectedColor ? 'pointer' : 'default',
      }}
      onClick={onColorClick}
    >
      {/* Fixed top section */}
      <div className="flex-shrink-0 px-4 pt-4 pb-2">
        <h2 className="text-2xl font-bold tracking-wide uppercase mb-2" style={{ color: theme.accent }}>
          This Week
        </h2>
        <button
          onClick={onToggleSchool}
          className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider transition-opacity hover:opacity-80"
          style={{ color: showSchool ? theme.sticker : theme.textSecondary }}
        >
          <span
            className="w-8 h-4 rounded-full flex items-center transition-all flex-shrink-0"
            style={{ backgroundColor: showSchool ? theme.sticker : 'rgba(255,255,255,0.15)', padding: 2 }}
          >
            <span
              className="w-3 h-3 rounded-full bg-white transition-transform"
              style={{ transform: showSchool ? 'translateX(16px)' : 'translateX(0)' }}
            />
          </span>
          School events
        </button>
      </div>

      {/* Scrollable events — min-h-0 allows it to actually shrink */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 custom-scrollbar space-y-5 py-2">
        {grouped.length === 0 ? (
          <p className="text-sm italic opacity-70">No events this week. Relax!</p>
        ) : (
          grouped.map(({ day, events: dayEvents }) => (
            <div key={day}>
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: theme.textSecondary }}>
                {day}
              </p>
              <div className="space-y-2">
                {dayEvents.map((event) => (
                  <button key={event.id} onClick={() => onEditEvent(event)} className="w-full text-left flex items-start gap-2 group">
                    <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: event.color || theme.sticker }} />
                    <div>
                      <p className="font-medium text-sm leading-tight group-hover:underline" style={{ color: theme.textPrimary }}>
                        {event.title}
                      </p>
                      {event.startTime && (
                        <p className="text-xs mt-0.5" style={{ color: theme.textSecondary }}>
                          {event.startTime}{event.endTime ? ` – ${event.endTime}` : ''}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

    </aside>
  );
}
