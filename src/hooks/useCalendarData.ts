import { useEffect, useState, useCallback } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { type Event, type PlacedSticker, type RepeatType } from '../types';

// Firestore document shapes
interface EventDoc {
  title: string;
  date: Timestamp;
  startTime?: string;
  endTime?: string;
  color?: string;
  icon?: string;
  isSchool?: boolean;
  repeat?: RepeatType;
}

interface StickerDoc {
  src: string;
  x: number;
  y: number;
  size: number;
  rotation: number;
}

interface AppStateDoc {
  cellColors: Record<string, string>;
  completedDays: Record<string, boolean>;
}

// All data lives under /users/{uid}/...
function userCol(uid: string, name: string) {
  return collection(db, 'users', uid, name);
}
function userDoc(uid: string, name: string, id: string) {
  return doc(db, 'users', uid, name, id);
}

export function useCalendarData(uid: string) {
  const [events, setEvents] = useState<Event[]>([]);
  const [stickers, setStickers] = useState<PlacedSticker[]>([]);
  const [cellColors, setCellColors] = useState<Record<string, string>>({});
  const [completedDays, setCompletedDays] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let eventsReady = false;
    let stickersReady = false;
    let stateReady = false;

    const checkReady = () => {
      if (eventsReady && stickersReady && stateReady) setLoading(false);
    };

    const unsubEvents = onSnapshot(userCol(uid, 'events'), (snap) => {
      setEvents(
        snap.docs.map((d) => {
          const data = d.data() as EventDoc;
          return {
            id: d.id,
            title: data.title,
            date: data.date.toDate(),
            startTime: data.startTime,
            endTime: data.endTime,
            color: data.color,
            icon: data.icon,
            isSchool: data.isSchool,
            repeat: data.repeat,
          };
        }),
      );
      eventsReady = true;
      checkReady();
    });

    const unsubStickers = onSnapshot(userCol(uid, 'stickers'), (snap) => {
      setStickers(
        snap.docs.map((d) => {
          const data = d.data() as StickerDoc;
          return { id: d.id, ...data };
        }),
      );
      stickersReady = true;
      checkReady();
    });

    const unsubState = onSnapshot(userDoc(uid, 'appState', 'main'), (snap) => {
      if (snap.exists()) {
        const data = snap.data() as AppStateDoc;
        setCellColors(data.cellColors ?? {});
        setCompletedDays(data.completedDays ?? {});
      }
      stateReady = true;
      checkReady();
    });

    return () => {
      unsubEvents();
      unsubStickers();
      unsubState();
    };
  }, [uid]);

  // --- Event mutations ---
  const addEvent = useCallback(async (ev: Omit<Event, 'id'>) => {
    const data: EventDoc = {
      title: ev.title,
      date: Timestamp.fromDate(ev.date),
      ...(ev.startTime && { startTime: ev.startTime }),
      ...(ev.endTime && { endTime: ev.endTime }),
      ...(ev.color && { color: ev.color }),
      ...(ev.icon && { icon: ev.icon }),
      ...(ev.isSchool && { isSchool: ev.isSchool }),
      ...(ev.repeat && ev.repeat !== 'none' && { repeat: ev.repeat }),
    };
    await addDoc(userCol(uid, 'events'), data);
  }, [uid]);

  const updateEvent = useCallback(async (id: string, ev: Omit<Event, 'id'>) => {
    const data: Partial<EventDoc> = {
      title: ev.title,
      date: Timestamp.fromDate(ev.date),
      startTime: ev.startTime ?? '',
      endTime: ev.endTime ?? '',
      color: ev.color ?? '',
      icon: ev.icon ?? '',
      isSchool: ev.isSchool ?? false,
      repeat: ev.repeat ?? 'none',
    };
    await updateDoc(userDoc(uid, 'events', id), data as Record<string, unknown>);
  }, [uid]);

  const deleteEvent = useCallback(async (id: string) => {
    await deleteDoc(userDoc(uid, 'events', id));
  }, [uid]);

  // --- Sticker mutations ---
  const addSticker = useCallback(async (sticker: Omit<PlacedSticker, 'id'>) => {
    await addDoc(userCol(uid, 'stickers'), sticker);
  }, [uid]);

  const moveSticker = useCallback(async (id: string, x: number, y: number) => {
    await updateDoc(userDoc(uid, 'stickers', id), { x, y });
  }, [uid]);

  const removeSticker = useCallback(async (id: string) => {
    await deleteDoc(userDoc(uid, 'stickers', id));
  }, [uid]);

  // --- App state mutations ---
  const setCellColor = useCallback(async (dateStr: string, color: string) => {
    setCellColors((prev) => {
      const next = { ...prev, [dateStr]: color };
      setDoc(userDoc(uid, 'appState', 'main'), { cellColors: next }, { merge: true });
      return next;
    });
  }, [uid]);

  const toggleDayCompletion = useCallback(async (dateStr: string) => {
    setCompletedDays((prev) => {
      const next = { ...prev, [dateStr]: !prev[dateStr] };
      setDoc(userDoc(uid, 'appState', 'main'), { completedDays: next }, { merge: true });
      return next;
    });
  }, [uid]);

  return {
    loading,
    events,
    stickers,
    cellColors,
    completedDays,
    addEvent,
    updateEvent,
    deleteEvent,
    addSticker,
    moveSticker,
    removeSticker,
    setCellColor,
    toggleDayCompletion,
  };
}
