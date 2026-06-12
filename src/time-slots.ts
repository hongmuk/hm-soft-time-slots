/**
 * 예약 시간슬롯 생성기.
 *
 * 운영시간·슬롯 길이·간격·휴식시간·기존 예약·정원을 받아
 * 예약 가능한 슬롯 목록을 계산합니다. 시간은 "HH:MM" 문자열로 다룹니다.
 */

/** "HH:MM" → 자정 기준 분. 잘못된 형식이면 NaN. */
export function parseTime(value: string): number {
  const m = /^(\d{1,2}):(\d{2})$/.exec((value ?? "").trim());
  if (!m) return NaN;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) return NaN;
  return h * 60 + min;
}

/** 분 → "HH:MM". */
export function formatTime(minutes: number): string {
  const m = ((minutes % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}

export interface TimeRange {
  start: string;
  end: string;
}

export interface SlotOptions {
  /** 운영 시작 "09:00" */
  start: string;
  /** 운영 종료 "18:00" */
  end: string;
  /** 슬롯 1개 길이(분) */
  slotMinutes: number;
  /** 슬롯 시작 간격(분). 기본 = slotMinutes */
  intervalMinutes?: number;
  /** 제외할 휴식시간 (예: 점심) */
  breaks?: TimeRange[];
  /** 이미 잡힌 예약 */
  bookings?: TimeRange[];
  /** 슬롯당 동시 예약 가능 수 (기본 1) */
  capacity?: number;
}

export interface Slot {
  start: string;
  end: string;
  startMin: number;
  endMin: number;
  /** 예약 가능 여부 (booked < capacity) */
  available: boolean;
  /** 이 슬롯과 겹치는 기존 예약 수 */
  booked: number;
}

function overlaps(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  return aStart < bEnd && bStart < aEnd;
}

function toRanges(list: TimeRange[] | undefined): Array<[number, number]> {
  return (list ?? [])
    .map((r) => [parseTime(r.start), parseTime(r.end)] as [number, number])
    .filter(([s, e]) => Number.isFinite(s) && Number.isFinite(e) && e > s);
}

/** 모든 슬롯(가능/불가 포함)을 생성. */
export function generateSlots(opts: SlotOptions): Slot[] {
  const startMin = parseTime(opts.start);
  const endMin = parseTime(opts.end);
  const slot = opts.slotMinutes;
  const step = opts.intervalMinutes ?? opts.slotMinutes;
  const capacity = opts.capacity ?? 1;

  if (!Number.isFinite(startMin) || !Number.isFinite(endMin)) return [];
  if (slot <= 0 || step <= 0 || endMin <= startMin) return [];

  const breaks = toRanges(opts.breaks);
  const bookings = toRanges(opts.bookings);

  const slots: Slot[] = [];
  for (let t = startMin; t + slot <= endMin; t += step) {
    const s = t;
    const e = t + slot;
    // 휴식시간과 겹치면 슬롯 자체를 제외
    if (breaks.some(([bs, be]) => overlaps(s, e, bs, be))) continue;
    const booked = bookings.filter(([bs, be]) => overlaps(s, e, bs, be)).length;
    slots.push({
      start: formatTime(s),
      end: formatTime(e),
      startMin: s,
      endMin: e,
      booked,
      available: booked < capacity,
    });
  }
  return slots;
}

/** 예약 가능한 슬롯만 반환. */
export function availableSlots(opts: SlotOptions): Slot[] {
  return generateSlots(opts).filter((s) => s.available);
}
