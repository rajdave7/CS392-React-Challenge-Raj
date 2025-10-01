import type { Course } from "../components/CourseList";

export function isOverlapping(allCourses: Record<string, Course>, currentlySelectedCourses: string[], key: string): boolean {
  const target = allCourses[key];
  if (!target) return false;
  return Object.entries(allCourses)
    .filter(([k]) => k !== key && currentlySelectedCourses.includes(k))
    .some(([_k, c]) => finalIsOverlapping(target, c));
}

function finalIsOverlapping(a: Course, b: Course): boolean {
  if (a.term !== b.term) return false;
  const ma = parseMeeting(a.meets);
  const mb = parseMeeting(b.meets);
  return meetingsConflict(ma, mb);
}

type Meeting = { days: string[]; start: number; end: number } | null;

const DAY_RE = /(Tu|Th|Sa|Su|M|W|F)/g;

function parseMeeting(meets: string): Meeting {
  if (!meets) return null;
  const parts = meets.trim().split(/\s+/);
  if (parts.length < 2) return null;
  const dayPart = parts[0];
  const timePart = parts.slice(1).join(" ");
  const days: string[] = [];
  DAY_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = DAY_RE.exec(dayPart)) !== null) {
    days.push(m[0]);
  }
  if (days.length === 0) return null;
  const tm = timePart.match(/(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})/);
  if (!tm) return null;
  const sh = Number(tm[1]), sm = Number(tm[2]), eh = Number(tm[3]), em = Number(tm[4]);
  const start = sh * 60 + sm;
  const end = eh * 60 + em;
  if (!(start < end)) return null;
  return { days, start, end };
}

function timesOverlap(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  return aStart < bEnd && bStart < aEnd;
}

function meetingsConflict(a: Meeting, b: Meeting): boolean {
  if (!a || !b) return false;
  for (const d of a.days) {
    if (b.days.includes(d)) return timesOverlap(a.start, a.end, b.start, b.end);
  }
  return false;
}
