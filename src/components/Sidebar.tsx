import { format, getDay } from 'date-fns';
import { Plus } from 'lucide-react';
import type { Event } from '../types';
import { theme } from '../theme';

type Props = {
  events: Event[];
  onAddEvent: () => void;
  onEditEvent: (event: Event) => void;
  showSchool: boolean;
  onToggleSchool: () => void;
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

export function Sidebar({ events, onAddEvent, onEditEvent, showSchool, onToggleSchool }: Props) {
  const grouped = groupByDay(events);

  return (
    <aside
      className="w-64 flex-shrink-0 p-4 grid border-r backdrop-blur-md h-full overflow-hidden"
      style={{ gridTemplateRows: 'auto auto 1fr auto', backgroundColor: theme.sidebarBg, borderColor: theme.cellBorder }}
      style={{ backgroundColor: theme.sidebarBg, borderColor: theme.cellBorder }}
    >
      <h2
        className="text-2xl font-bold tracking-wide uppercase"
        style={{ color: theme.accent }}
      >
        This Week
      </h2>

      {/* School events toggle */}
      <button
        onClick={onToggleSchool}
        className="flex items-center gap-2 mt-2 mb-3 text-xs font-semibold uppercase tracking-wider transition-opacity hover:opacity-80"
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

      <div className="overflow-y-auto pr-2 custom-scrollbar space-y-5 min-h-0">
        {grouped.length === 0 ? (
          <p className="text-sm italic opacity-70">No events this week. Relax!</p>
        ) : (
          grouped.map(({ day, events: dayEvents }) => (
            <div key={day}>
              <p
                className="text-xs font-bold uppercase tracking-widest mb-2"
                style={{ color: theme.textSecondary }}
              >
                {day}
              </p>
              <div className="space-y-2">
                {dayEvents.map((event) => (
                  <button
                    key={event.id}
                    onClick={() => onEditEvent(event)}
                    className="w-full text-left flex items-start gap-2 group"
                  >
                    <div
                      className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                      style={{ backgroundColor: event.color || theme.sticker }}
                    />
                    <div>
                      <p
                        className="font-medium text-sm leading-tight group-hover:underline"
                        style={{ color: theme.textPrimary }}
                      >
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

      <div className="pt-3">
        <button
          onClick={onAddEvent}
          className="w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-transform hover:scale-105 active:scale-95"
          style={{ backgroundColor: theme.accent, color: theme.bg }}
        >
          <Plus size={20} />
          <span>Add Event</span>
        </button>
      </div>
    </aside>
  );
}
