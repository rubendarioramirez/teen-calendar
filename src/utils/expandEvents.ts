import { addDays, addMonths, addYears, startOfDay } from 'date-fns';
import type { Event } from '../types';

function advance(date: Date, repeat: string): Date {
  switch (repeat) {
    case 'daily':   return addDays(date, 1);
    case 'weekly':  return addDays(date, 7);
    case 'monthly': return addMonths(date, 1);
    case 'yearly':  return addYears(date, 1);
    default:        return addDays(date, 9999); // break the loop
  }
}

/**
 * Returns all events visible within [rangeStart, rangeEnd].
 * Repeated events are expanded into individual occurrences.
 * Non-repeated events are returned as-is.
 */
export function expandEvents(events: Event[], rangeStart: Date, rangeEnd: Date): Event[] {
  const result: Event[] = [];
  const start = startOfDay(rangeStart);
  const end = startOfDay(rangeEnd);

  for (const event of events) {
    if (!event.repeat || event.repeat === 'none') {
      result.push(event);
      continue;
    }

    let current = startOfDay(new Date(event.date));
    while (current <= end) {
      if (current >= start) {
        result.push({
          ...event,
          id: `${event.id}_R_${current.toISOString().slice(0, 10)}`,
          date: new Date(current),
        });
      }
      current = advance(current, event.repeat);
    }
  }

  return result;
}

/** Extracts the original event ID from a repeated-occurrence ID. */
export function originalId(id: string): string {
  return id.includes('_R_') ? id.split('_R_')[0] : id;
}
