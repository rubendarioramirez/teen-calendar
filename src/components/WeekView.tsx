import { useEffect, useRef } from 'react';
import { format, addDays, isSameDay, getWeek } from 'date-fns';
import { ChevronLeft } from 'lucide-react';
import type { Event } from '../types';
import { theme } from '../theme';

type Props = {
  weekStart: Date;
  events: Event[];
  onBack: () => void;
  onEditEvent: (event: Event) => void;
};

const HOURS = Array.from({ length: 17 }, (_, i) => i + 6); // 6 AM – 10 PM
const SLOT_H = 64; // px per hour

function parseHours(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h + m / 60;
}

export function WeekView({ weekStart, events, onBack, onEditEvent }: Props) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const weekNumber = getWeek(weekStart, { weekStartsOn: 0 });
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      // Scroll so 3 PM is near the top (15 - HOURS[0]=6) * 64px
      scrollRef.current.scrollTop = (15 - 6) * SLOT_H - 80;
    }
  }, []);

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <header
        className="flex items-center gap-4 p-6 border-b flex-shrink-0"
        style={{ borderColor: theme.cellBorder }}
      >
        <button
          onClick={onBack}
          className="p-2 rounded-full hover:bg-white/10 transition-colors"
          title="Back to month"
        >
          <ChevronLeft size={24} style={{ color: theme.textPrimary }} />
        </button>
        <div>
          <p
            className="text-sm uppercase tracking-widest font-semibold"
            style={{ color: theme.textSecondary }}
          >
            Week
          </p>
          <p className="text-4xl font-black leading-none" style={{ color: theme.accent }}>
            {weekNumber}
          </p>
        </div>
        <span className="text-sm ml-2" style={{ color: theme.textSecondary }}>
          {format(weekStart, 'MMM d')} – {format(addDays(weekStart, 6), 'MMM d, yyyy')}
        </span>
      </header>

      {/* Scrollable grid */}
      <div ref={scrollRef} className="flex-1 overflow-auto">
        {/* Sticky day headers */}
        <div
          className="sticky top-0 z-10 grid border-b"
          style={{
            gridTemplateColumns: '52px repeat(7, 1fr)',
            borderColor: theme.cellBorder,
            backgroundColor: theme.bg,
          }}
        >
          <div /> {/* time gutter spacer */}
          {days.map((day) => (
            <div
              key={day.toISOString()}
              className="text-center py-3 border-l"
              style={{ borderColor: theme.cellBorder }}
            >
              <p
                className="text-xs font-bold uppercase tracking-wider"
                style={{ color: theme.textSecondary }}
              >
                {format(day, 'EEE')}
              </p>
              <p
                className="text-xl font-black"
                style={{ color: isSameDay(day, new Date()) ? '#16a34a' : theme.headerText }}
              >
                {format(day, 'd')}
              </p>
            </div>
          ))}
        </div>

        {/* Time grid */}
        <div
          className="grid"
          style={{ gridTemplateColumns: '52px repeat(7, 1fr)' }}
        >
          {/* Hour labels */}
          <div className="flex-shrink-0">
            {HOURS.map((h) => (
              <div
                key={h}
                className="text-right pr-2 text-xs flex-shrink-0 select-none"
                style={{
                  height: SLOT_H,
                  color: theme.textSecondary,
                  paddingTop: 4,
                }}
              >
                {h}:00
              </div>
            ))}
          </div>

          {/* Day columns */}
          {days.map((day) => {
            const dayEvents = events.filter((e) => isSameDay(e.date, day));
            const timed = dayEvents.filter((e) => e.startTime);
            const allDay = dayEvents.filter((e) => !e.startTime);

            return (
              <div
                key={day.toISOString()}
                className="relative border-l"
                style={{
                  borderColor: theme.cellBorder,
                  height: HOURS.length * SLOT_H,
                }}
              >
                {/* Hour slot lines */}
                {HOURS.map((h) => (
                  <div
                    key={h}
                    className="border-b"
                    style={{
                      height: SLOT_H,
                      borderColor: theme.cellBorder + '55',
                    }}
                  />
                ))}

                {/* All-day events (no time) pinned at top */}
                {allDay.map((event, i) => (
                  <div
                    key={event.id}
                    onClick={() => onEditEvent(event)}
                    className="absolute left-1 right-1 rounded px-1 py-0.5 text-xs cursor-pointer hover:brightness-110 transition-all truncate font-semibold"
                    style={{
                      top: i * 22,
                      backgroundColor: event.color || theme.eventBg,
                      color: theme.bg,
                      zIndex: 2,
                    }}
                  >
                    {event.title}
                  </div>
                ))}

                {/* Timed events */}
                {timed.map((event) => {
                  const start = parseHours(event.startTime!);
                  const end = event.endTime ? parseHours(event.endTime) : start + 0.5;
                  const top = (start - HOURS[0]) * SLOT_H;
                  const height = Math.max((end - start) * SLOT_H, 24);

                  return (
                    <div
                      key={event.id}
                      onClick={() => onEditEvent(event)}
                      className="absolute left-1 right-1 rounded px-1.5 py-1 text-xs cursor-pointer hover:brightness-110 transition-all overflow-hidden"
                      style={{
                        top,
                        height,
                        backgroundColor: event.color || theme.eventBg,
                        color: theme.bg,
                        zIndex: 2,
                      }}
                    >
                      <p className="font-semibold truncate">{event.title}</p>
                      <p className="opacity-80">
                        {event.startTime}{event.endTime ? ` – ${event.endTime}` : ''}
                      </p>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
