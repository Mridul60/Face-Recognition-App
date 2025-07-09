// components/IconSymbol.tsx
import React from 'react';
import HistoryIcon from '@/assets/icons/history.svg';
import ProfileIcon from '@/assets/icons/person.svg';
import TeamAttendance from '@/assets/icons/fluent--shifts-team-24-filled.svg'
import Dashboard from '@/assets/icons/material-symbols--home-rounded.svg'
import WorkInTime from '@/assets/icons/mdi--timer-play.svg'
import WorkOutTime from '@/assets/icons/mdi--timer-stop.svg'


const iconsMap: Record<string, any> = {
  history: HistoryIcon,
  profile: ProfileIcon,
  team: TeamAttendance,
  home: Dashboard,
  intime: WorkInTime,
  outtime: WorkOutTime, 
};

export function IconSymbol({
  name,
  color,
  size,
}: {
  name: keyof typeof iconsMap;
  color: string;
  size: number;
}) {
  const Icon = iconsMap[name];
  
  if (!Icon) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }

  return Icon ? <Icon width={size} height={size} color={color} /> : null;
}
