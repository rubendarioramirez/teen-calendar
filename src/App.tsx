import React, { useState, useRef } from 'react';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  addDays,
  getWeek,
  isWithinInterval,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Smile, X, Trash2, LogOut } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { theme, PALETTE } from './theme';
import { type Event, emptyForm } from './types';
import { expandEvents, originalId } from './utils/expandEvents';
import { Sidebar } from './components/Sidebar';
import { WeekView } from './components/WeekView';
import { StickerPicker } from './components/StickerPicker';
import { StickerLayer } from './components/StickerLayer';
import { IconPicker } from './components/IconPicker';
import { useCalendarData } from './hooks/useCalendarData';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Props {
  uid: string;
  onSignOut: () => void;
}

export default function App({ uid, onSignOut: signOut }: Props) {
  const {
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
  } = useCalendarData(uid);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [view, setView] = useState<'month' | 'week'>('month');
  const [showSchool, setShowSchool] = useState(true);
  const [selectedSticker, setSelectedSticker] = useState<string | null>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const stickerJustDragged = useRef(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const handleCalendarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (stickerJustDragged.current) { stickerJustDragged.current = false; return; }
    if (!selectedSticker || !calendarRef.current) return;
    const rect = calendarRef.current.getBoundingClientRect();
    const size = 90;
    addSticker({
      src: selectedSticker,
      x: e.clientX - rect.left - size / 2,
      y: e.clientY - rect.top - size / 2,
      size,
      rotation: Math.random() * 20 - 10,
    });
  };

  const openNew = () => {
    setEditingId(null);
    setForm({ ...emptyForm, date: format(new Date(), 'yyyy-MM-dd') });
    setModalOpen(true);
  };

  const openEdit = (event: Event) => {
    // For repeated occurrences, find and edit the original event
    const baseId = originalId(event.id);
    const original = events.find((e) => e.id === baseId) ?? event;
    setEditingId(baseId);
    setForm({
      title: original.title,
      date: format(original.date, 'yyyy-MM-dd'),
      startTime: original.startTime || '',
      endTime: original.endTime || '',
      color: original.color || '',
      icon: original.icon || '',
      isSchool: original.isSchool ?? false,
      repeat: original.repeat ?? 'none',
    });
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.date) return;
    const [year, month, day] = form.date.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const payload = {
      title: form.title,
      date,
      startTime: form.startTime || undefined,
      endTime: form.endTime || undefined,
      color: form.color || undefined,
      icon: form.icon || undefined,
      isSchool: form.isSchool || undefined,
      repeat: form.repeat !== 'none' ? form.repeat : undefined,
    };
    if (editingId) {
      updateEvent(editingId, payload);
    } else {
      addEvent(payload);
    }
    closeModal();
  };

  const handleDelete = () => {
    if (editingId) deleteEvent(editingId);
    closeModal();
  };

  // Calendar logic
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 }); // Week starts on Sunday
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const weekNumber = getWeek(currentDate, { weekStartsOn: 0 });

  const visibleEvents = expandEvents(
    showSchool ? events : events.filter((e) => !e.isSchool),
    startDate,
    endDate,
  );

  const dateFormat = 'd';
  const rows = [];
  let days = [];
  let day = startDate;
  let formattedDate = '';

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      formattedDate = format(day, dateFormat);
      const cloneDay = day;
      const dateStr = format(cloneDay, 'yyyy-MM-dd');
      const isCompleted = completedDays[dateStr];
      const dayEvents = visibleEvents.filter((e) => isSameDay(e.date, cloneDay));
      const cellColor = cellColors[dateStr];

      days.push(
        <div
          key={day.toString()}
          onClick={() => {
            if (selectedColor) {
              setCellColor(dateStr, cellColors[dateStr] === selectedColor ? '' : selectedColor);
            }
          }}
          className={cn(
            'relative flex flex-col p-2 border-r border-b transition-colors',
            selectedColor ? 'cursor-pointer' : '',
            !isSameMonth(day, monthStart) ? 'opacity-50' : ''
          )}
          style={{
            backgroundColor: cellColor || (!isSameMonth(day, monthStart) ? theme.cellBgOtherMonth : theme.cellBg),
            borderColor: theme.cellBorder,
          }}
        >
          <div className="flex justify-between items-start">
            <span
              className="text-sm font-bold bg-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0"
              style={{ color: isSameDay(day, new Date()) ? '#16a34a' : '#000' }}
            >
              {formattedDate}
            </span>
            <button
              onClick={() => toggleDayCompletion(dateStr)}
              className="hover:scale-110 transition-transform focus:outline-none"
              title="Mark day as done!"
            >
              <Smile
                size={24}
                style={{
                  color: isCompleted ? theme.sticker : 'transparent',
                  stroke: isCompleted ? theme.sticker : theme.textSecondary,
                  opacity: isCompleted ? 1 : 0.3,
                }}
              />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto mt-1 space-y-1 no-scrollbar">
            {dayEvents.map((event) => (
              <div
                key={event.id}
                onClick={(e) => { e.stopPropagation(); openEdit(event); }}
                className="text-xs px-1.5 py-1 rounded-lg cursor-pointer hover:brightness-110 transition-all flex items-start gap-1"
                style={{ backgroundColor: event.color || theme.eventBg, color: theme.bg }}
                title={event.title}
              >
                {event.icon && (
                  <span className="text-sm leading-none flex-shrink-0 mt-0.5">{event.icon}</span>
                )}
                <div className="min-w-0">
                  <div className="font-semibold truncate leading-tight">{event.title}</div>
                  {event.startTime && (
                    <div className="opacity-70 text-[10px]">
                      {event.startTime}{event.endTime ? ` – ${event.endTime}` : ''}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
      day = addDays(day, 1);
    }
    rows.push(
      <div className="grid grid-cols-7 flex-1" key={day.toString()}>
        {days}
      </div>
    );
    days = [];
  }

  // This week's events
  const currentWeekStart = startOfWeek(new Date(), { weekStartsOn: 0 });
  const currentWeekEnd = endOfWeek(new Date(), { weekStartsOn: 0 });

  const thisWeekEvents = expandEvents(
    showSchool ? events : events.filter((e) => !e.isSchool),
    currentWeekStart,
    currentWeekEnd,
  )
    .filter((e) => isWithinInterval(e.date, { start: currentWeekStart, end: currentWeekEnd }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  return (
    <div 
      className="h-screen overflow-hidden flex font-sans"
      style={{
        backgroundColor: theme.bg,
        color: theme.textPrimary
      }}
    >
      <Sidebar
        events={thisWeekEvents}
        onAddEvent={openNew}
        onEditEvent={openEdit}
        showSchool={showSchool}
        onToggleSchool={() => setShowSchool((v) => !v)}
      />

      {/* Main Calendar Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {view === 'week' && (
          <WeekView
            weekStart={startOfWeek(currentDate, { weekStartsOn: 0 })}
            events={events}
            onBack={() => setView('month')}
            onEditEvent={openEdit}
          />
        )}
        {view === 'month' && <>
        {/* Header */}
        <header className="flex items-center justify-between p-6 border-b" style={{ borderColor: theme.cellBorder }}>
          <div className="flex items-center space-x-4">
            <button onClick={prevMonth} className="p-2 rounded-full hover:bg-white/10 transition-colors">
              <ChevronLeft size={24} />
            </button>
            <h1 className="text-4xl font-black tracking-wider uppercase" style={{ color: theme.headerText, fontFamily: 'Champagne, sans-serif' }}>
              {format(currentDate, 'MMMM')}
            </h1>
            <button onClick={nextMonth} className="p-2 rounded-full hover:bg-white/10 transition-colors">
              <ChevronRight size={24} />
            </button>
          </div>
          
          <div className="flex items-center space-x-6">
            <button
              onClick={() => setView('week')}
              className="text-right hover:opacity-70 transition-opacity"
              title="Switch to week view"
            >
              <p className="text-sm uppercase tracking-widest font-semibold" style={{ color: theme.textSecondary }}>
                Week
              </p>
              <p className="text-3xl font-black" style={{ color: theme.accent }}>
                {weekNumber}
              </p>
            </button>
            {/* Color Palette */}
            <div className="flex items-center gap-2 flex-wrap max-w-[220px]">
              {PALETTE.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor((prev) => prev === color ? null : color)}
                  title={color}
                  className="transition-transform hover:scale-110 active:scale-95"
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    backgroundColor: color,
                    border: selectedColor === color ? '3px solid white' : '2px solid rgba(255,255,255,0.2)',
                    boxShadow: selectedColor === color ? `0 0 8px ${color}` : 'none',
                  }}
                />
              ))}
              {/* Eraser */}
              <button
                onClick={() => setSelectedColor(null)}
                title="Deselect"
                className="transition-transform hover:scale-110 active:scale-95 flex items-center justify-center text-xs font-bold"
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  border: selectedColor === null ? '3px solid white' : '2px solid rgba(255,255,255,0.2)',
                  color: theme.textSecondary,
                }}
              >
                ✕
              </button>
            </div>
            <div
              className="w-px self-stretch mx-1"
              style={{ backgroundColor: theme.cellBorder }}
            />
            <StickerPicker
              selectedSticker={selectedSticker}
              onSelect={setSelectedSticker}
            />
            <div
              className="w-px self-stretch mx-1"
              style={{ backgroundColor: theme.cellBorder }}
            />
            <button
              onClick={signOut}
              title="Sign out"
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <LogOut size={20} style={{ color: theme.textSecondary }} />
            </button>
          </div>
        </header>

        {/* Calendar Grid */}
        <div
          ref={calendarRef}
          className="flex-1 flex flex-col p-6 overflow-hidden relative"
          onClick={handleCalendarClick}
          style={{ cursor: selectedSticker ? 'crosshair' : 'default' }}
        >
          <StickerLayer
            stickers={stickers}
            onMove={moveSticker}
            onRemove={removeSticker}
            onDragStart={() => { stickerJustDragged.current = true; }}
          />
          {/* Days of week header */}
          <div className="grid grid-cols-7 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div
                key={day}
                className="text-center font-bold text-sm uppercase tracking-wider"
                style={{ color: theme.textSecondary }}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Body */}
          <div
            className="flex-1 flex flex-col border-t border-l rounded-xl overflow-hidden shadow-2xl backdrop-blur-sm"
            style={{ borderColor: theme.cellBorder }}
          >
            {rows}
          </div>
        </div>
        </>}
      </div>

      {/* Event Modal (create & edit) */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div
            className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
            style={{ backgroundColor: theme.modalBg, border: `1px solid ${theme.cellBorder}` }}
          >
            <div className="flex justify-between items-center p-6 border-b" style={{ borderColor: theme.cellBorder }}>
              <h3 className="text-xl font-bold" style={{ color: theme.headerText }}>
                {editingId ? 'Edit Event' : 'New Event'}
              </h3>
              <button onClick={closeModal} className="p-1 rounded-full hover:bg-white/10 transition-colors">
                <X size={20} style={{ color: theme.textSecondary }} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: theme.textSecondary }}>
                  Event Title
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Math homework"
                  className="w-full px-4 py-3 rounded-xl outline-none transition-shadow"
                  style={{ backgroundColor: theme.cellBg, color: theme.textPrimary, border: `1px solid ${theme.cellBorder}` }}
                />
              </div>

              {/* School toggle + Repeat — same row */}
              <div className="flex items-center gap-3">
                {/* School checkbox */}
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, isSchool: !f.isSchool }))}
                  className="flex items-center gap-2 flex-1 px-3 py-2 rounded-xl transition-all"
                  style={{
                    border: `1px solid ${form.isSchool ? theme.sticker : theme.cellBorder}`,
                    backgroundColor: form.isSchool ? 'rgba(100,180,196,0.15)' : 'transparent',
                    color: form.isSchool ? theme.sticker : theme.textSecondary,
                  }}
                >
                  <span className="text-lg">🏫</span>
                  <span className="text-sm font-semibold">School</span>
                </button>

                {/* Repeat */}
                <div className="flex-1">
                  <select
                    value={form.repeat}
                    onChange={(e) => setForm((f) => ({ ...f, repeat: e.target.value as typeof f.repeat }))}
                    className="w-full px-3 py-2 rounded-xl outline-none text-sm"
                    style={{ backgroundColor: theme.cellBg, color: theme.textPrimary, border: `1px solid ${theme.cellBorder}`, colorScheme: 'dark' }}
                  >
                    <option value="none">No repeat</option>
                    <option value="daily">Every day</option>
                    <option value="weekly">Every week</option>
                    <option value="monthly">Every month</option>
                    <option value="yearly">Every year</option>
                  </select>
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: theme.textSecondary }}>Date</label>
                <input
                  type="date"
                  required
                  value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl outline-none transition-shadow"
                  style={{ backgroundColor: theme.cellBg, color: theme.textPrimary, border: `1px solid ${theme.cellBorder}`, colorScheme: 'dark' }}
                />
              </div>

              {/* Times */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1" style={{ color: theme.textSecondary }}>Start time</label>
                  <input
                    type="time"
                    value={form.startTime}
                    onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl outline-none"
                    style={{ backgroundColor: theme.cellBg, color: theme.textPrimary, border: `1px solid ${theme.cellBorder}`, colorScheme: 'dark' }}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1" style={{ color: theme.textSecondary }}>
                    End time <span className="opacity-50">(optional)</span>
                  </label>
                  <input
                    type="time"
                    value={form.endTime}
                    onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl outline-none"
                    style={{ backgroundColor: theme.cellBg, color: theme.textPrimary, border: `1px solid ${theme.cellBorder}`, colorScheme: 'dark' }}
                  />
                </div>
              </div>

              {/* Color picker */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.textSecondary }}>Color</label>
                <div className="flex flex-wrap gap-2">
                  {PALETTE.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, color: f.color === color ? '' : color }))}
                      style={{
                        width: 28, height: 28, borderRadius: '50%',
                        backgroundColor: color,
                        border: form.color === color ? '3px solid white' : '2px solid rgba(255,255,255,0.2)',
                        boxShadow: form.color === color ? `0 0 8px ${color}` : 'none',
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Icon picker */}
              <IconPicker
                selected={form.icon}
                onSelect={(emoji) => setForm((f) => ({ ...f, icon: emoji }))}
              />

              {/* Actions */}
              <div className="pt-2 flex gap-3">
                {editingId && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="p-3 rounded-xl transition-colors hover:bg-red-500/20"
                    style={{ color: '#f87171' }}
                    title="Delete event"
                  >
                    <Trash2 size={20} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-3 rounded-xl font-semibold transition-colors hover:bg-white/5"
                  style={{ color: theme.textSecondary }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl font-bold transition-transform hover:scale-105 active:scale-95"
                  style={{ backgroundColor: form.color || theme.accent, color: theme.bg }}
                >
                  {editingId ? 'Save Changes' : 'Save Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

