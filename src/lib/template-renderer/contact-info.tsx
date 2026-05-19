/**
 * Shared ContactInfo component for all resume templates.
 *
 * Renders personal info fields in a responsive CSS Grid layout,
 * each with a semantic Lucide icon. Website is rendered as a
 * separate full-width row below the grid (URLs tend to be long).
 */

import React from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Github,
  Globe,
  MessageCircle,
  Calendar,
  User,
  Clock,
  GraduationCap,
  Home,
  Heart,
  Flag,
  Users,
  LinkIcon,
} from 'lucide-react';
import type { PersonalInfoContent } from '@/types/resume';

// ============================================================================
// SVG Icons for HTML Export (colorable via currentColor)
// ============================================================================

const SVG_SIZE = 'width="12" height="12"';
const SVG_VIEWBOX = 'viewBox="0 0 24 24"';

const SVG_ICONS = {
  phone: `<svg ${SVG_VIEWBOX} ${SVG_SIZE} fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384"/></svg>`,
  mapPin: `<svg ${SVG_VIEWBOX} ${SVG_SIZE} fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>`,
  linkedin: `<svg ${SVG_VIEWBOX} ${SVG_SIZE} fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>`,
  github: `<svg ${SVG_VIEWBOX} ${SVG_SIZE} fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>`,
  calendar: `<svg ${SVG_VIEWBOX} ${SVG_SIZE} fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>`,
  user: `<svg ${SVG_VIEWBOX} ${SVG_SIZE} fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  clock: `<svg ${SVG_VIEWBOX} ${SVG_SIZE} fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 6v6l4 2"/><circle cx="12" cy="12" r="10"/></svg>`,
  graduationCap: `<svg ${SVG_VIEWBOX} ${SVG_SIZE} fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/></svg>`,
  house: `<svg ${SVG_VIEWBOX} ${SVG_SIZE} fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>`,
  heart: `<svg ${SVG_VIEWBOX} ${SVG_SIZE} fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5"/></svg>`,
  flag: `<svg ${SVG_VIEWBOX} ${SVG_SIZE} fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22V4a1 1 0 0 1 .4-.8A6 6 0 0 1 8 2c3 0 5 2 7.333 2q2 0 3.067-.8A1 1 0 0 1 20 4v10a1 1 0 0 1-.4.8A6 6 0 0 1 16 16c-3 0-5-2-8-2a6 6 0 0 0-4 1.528"/></svg>`,
  users: `<svg ${SVG_VIEWBOX} ${SVG_SIZE} fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><path d="M16 3.128a4 4 0 0 1 0 7.744"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><circle cx="9" cy="7" r="4"/></svg>`,
  mail: `<svg ${SVG_VIEWBOX} ${SVG_SIZE} fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"/><rect width="20" height="16" x="2" y="4" rx="2"/></svg>`,
  messageCircle: `<svg ${SVG_VIEWBOX} ${SVG_SIZE} fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719"/></svg>`,
  globe: `<svg ${SVG_VIEWBOX} ${SVG_SIZE} fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>`,
  link: `<svg ${SVG_VIEWBOX} ${SVG_SIZE} fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`,
} as const;

// ============================================================================
// Contact Entry (shared by React preview and HTML export)
// ============================================================================

export interface ContactEntry {
  icon: React.FC<{ size?: number; color?: string }>;
  value: string;
  htmlIcon: string;
}

/**
 * Build contact entries split into two rows:
 *   Row 1 (short): phone, location, linkedin, github, age, gender,
 *                  yearsOfExperience, educationLevel, hometown,
 *                  maritalStatus, politicalStatus, ethnicity
 *   Row 2 (long):  email, wechat, website, customLinks
 */
export function buildContactEntries(pi: PersonalInfoContent): { row1: ContactEntry[]; row2: ContactEntry[] } {
  const row1: ContactEntry[] = [];
  const row2: ContactEntry[] = [];

  if (pi.phone) row1.push({ icon: Phone, value: pi.phone, htmlIcon: SVG_ICONS.phone });
  if (pi.location) row1.push({ icon: MapPin, value: pi.location, htmlIcon: SVG_ICONS.mapPin });
  if (pi.linkedin) row1.push({ icon: Linkedin, value: pi.linkedin, htmlIcon: SVG_ICONS.linkedin });
  if (pi.github) row1.push({ icon: Github, value: pi.github, htmlIcon: SVG_ICONS.github });
  if (pi.age) row1.push({ icon: Calendar, value: pi.age, htmlIcon: SVG_ICONS.calendar });
  if (pi.gender) row1.push({ icon: User, value: pi.gender, htmlIcon: SVG_ICONS.user });
  if (pi.yearsOfExperience) row1.push({ icon: Clock, value: pi.yearsOfExperience, htmlIcon: SVG_ICONS.clock });
  if (pi.educationLevel) row1.push({ icon: GraduationCap, value: pi.educationLevel, htmlIcon: SVG_ICONS.graduationCap });
  if (pi.hometown) row1.push({ icon: Home, value: pi.hometown, htmlIcon: SVG_ICONS.house });
  if (pi.maritalStatus) row1.push({ icon: Heart, value: pi.maritalStatus, htmlIcon: SVG_ICONS.heart });
  if (pi.politicalStatus) row1.push({ icon: Flag, value: pi.politicalStatus, htmlIcon: SVG_ICONS.flag });
  if (pi.ethnicity) row1.push({ icon: Users, value: pi.ethnicity, htmlIcon: SVG_ICONS.users });

  if (pi.email) row2.push({ icon: Mail, value: pi.email, htmlIcon: SVG_ICONS.mail });
  if (pi.wechat) row2.push({ icon: MessageCircle, value: pi.wechat, htmlIcon: SVG_ICONS.messageCircle });
  if (pi.website) row2.push({ icon: Globe, value: pi.website, htmlIcon: SVG_ICONS.globe });
  if (pi.customLinks) {
    for (const link of pi.customLinks) {
      row2.push({ icon: LinkIcon, value: `${link.label}: ${link.url}`, htmlIcon: SVG_ICONS.link });
    }
  }

  return { row1, row2 };
}

// ============================================================================
// React Component
// ============================================================================

export function ContactInfo({
  pi,
  iconColor = '#71717a',
  iconSize = 13,
  align = 'center',
  className,
  style,
}: {
  pi: PersonalInfoContent;
  iconColor?: string;
  iconSize?: number;
  align?: 'center' | 'left';
  className?: string;
  style?: React.CSSProperties;
}) {
  const { row1, row2 } = buildContactEntries(pi);
  if (row1.length === 0 && row2.length === 0) return null;

  const rowStyle: React.CSSProperties = {
    fontSize: '13px',
    color: '#6B7280',
    textAlign: align,
    ...style,
  };
  const itemClass = align === 'center'
    ? 'inline-flex items-center gap-1.5 mx-2 my-0.5'
    : 'inline-flex items-center gap-1.5 mr-4 my-0.5';
  const rowClassName = `mt-1 ${className || ''}`.trim();

  return (
    <>
      {row1.length > 0 && (
        <div className={rowClassName} style={rowStyle}>
          {row1.map((c, i) => (
            <span key={i} className={itemClass}>
              <span className="shrink-0"><c.icon size={iconSize} color={iconColor} /></span>
              <span>{c.value}</span>
            </span>
          ))}
        </div>
      )}
      {row2.length > 0 && (
        <div
          className={className}
          style={{ ...rowStyle, marginTop: row1.length > 0 ? '2px' : '8px' }}
        >
          {row2.map((c, i) => (
            <span key={i} className={itemClass}>
              <span className="shrink-0"><c.icon size={iconSize} color={iconColor} /></span>
              <span>{c.value}</span>
            </span>
          ))}
        </div>
      )}
    </>
  );
}
