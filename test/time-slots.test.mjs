import { test } from "node:test";
import assert from "node:assert/strict";
import {
  parseTime,
  formatTime,
  generateSlots,
  availableSlots,
} from "../dist/index.js";

test("parseTime / formatTime", () => {
  assert.equal(parseTime("09:30"), 570);
  assert.equal(parseTime("00:00"), 0);
  assert.ok(Number.isNaN(parseTime("25:00")));
  assert.ok(Number.isNaN(parseTime("abc")));
  assert.equal(formatTime(570), "09:30");
  assert.equal(formatTime(0), "00:00");
});

test("기본 슬롯 생성", () => {
  const slots = generateSlots({ start: "09:00", end: "11:00", slotMinutes: 30 });
  assert.equal(slots.length, 4);
  assert.deepEqual(
    slots.map((s) => `${s.start}-${s.end}`),
    ["09:00-09:30", "09:30-10:00", "10:00-10:30", "10:30-11:00"],
  );
  assert.ok(slots.every((s) => s.available && s.booked === 0));
});

test("intervalMinutes로 간격 조정", () => {
  const slots = generateSlots({ start: "09:00", end: "10:00", slotMinutes: 30, intervalMinutes: 60 });
  assert.deepEqual(slots.map((s) => s.start), ["09:00"]);
});

test("휴식시간(점심)은 제외", () => {
  const slots = generateSlots({
    start: "11:30",
    end: "13:30",
    slotMinutes: 30,
    breaks: [{ start: "12:00", end: "13:00" }],
  });
  assert.deepEqual(slots.map((s) => s.start), ["11:30", "13:00"]);
});

test("기존 예약은 booked/available에 반영", () => {
  const opts = {
    start: "09:00",
    end: "10:00",
    slotMinutes: 30,
    bookings: [{ start: "09:00", end: "09:30" }],
  };
  const slots = generateSlots(opts);
  assert.equal(slots[0].booked, 1);
  assert.equal(slots[0].available, false);
  assert.equal(slots[1].available, true);
  assert.deepEqual(availableSlots(opts).map((s) => s.start), ["09:30"]);
});

test("capacity로 동시 예약 허용", () => {
  const slots = generateSlots({
    start: "09:00",
    end: "09:30",
    slotMinutes: 30,
    capacity: 2,
    bookings: [{ start: "09:00", end: "09:30" }],
  });
  assert.equal(slots[0].booked, 1);
  assert.equal(slots[0].available, true); // 정원 2 > 예약 1
});

test("잘못된 입력은 빈 배열", () => {
  assert.deepEqual(generateSlots({ start: "x", end: "10:00", slotMinutes: 30 }), []);
  assert.deepEqual(generateSlots({ start: "10:00", end: "09:00", slotMinutes: 30 }), []);
  assert.deepEqual(generateSlots({ start: "09:00", end: "10:00", slotMinutes: 0 }), []);
});
