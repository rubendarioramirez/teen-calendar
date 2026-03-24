export type RepeatType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';

export type Event = {
  id: string;
  date: Date;
  title: string;
  startTime?: string;
  endTime?: string;
  color?: string;
  icon?: string;
  isSchool?: boolean;
  repeat?: RepeatType;
};

export type PlacedSticker = {
  id: string;
  src: string;
  x: number;
  y: number;
  size: number;
  rotation: number;
};

export const emptyForm = {
  title: '',
  date: '',
  startTime: '',
  endTime: '',
  color: '',
  icon: '',
  isSchool: false,
  repeat: 'none' as RepeatType,
};
