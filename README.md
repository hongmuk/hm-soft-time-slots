# @hm-soft/time-slots

예약 시스템용 **시간슬롯 생성기**. 운영시간·슬롯 길이·간격·휴식시간·기존 예약·정원을 받아
예약 가능한 슬롯을 계산합니다. 의존성 0, 순수 함수.

## 설치

```bash
npm install @hm-soft/time-slots
```

## 사용

```ts
import { generateSlots, availableSlots } from "@hm-soft/time-slots";

const slots = generateSlots({
  start: "09:00",
  end: "18:00",
  slotMinutes: 60,
  breaks: [{ start: "12:00", end: "13:00" }],      // 점심 제외
  bookings: [{ start: "14:00", end: "15:00" }],    // 이미 잡힌 예약
  capacity: 1,
});
// → [{ start:"09:00", end:"10:00", available:true, booked:0, ... }, ...]
//    12:00 슬롯은 제외, 14:00 슬롯은 available:false

// 가능한 슬롯만
availableSlots({ start: "09:00", end: "11:00", slotMinutes: 30 });
// → 09:00, 09:30, 10:00, 10:30
```

## API

| 함수 | 설명 |
|------|------|
| `generateSlots(opts)` | 전체 슬롯(가능/불가 포함) 생성 |
| `availableSlots(opts)` | 예약 가능한 슬롯만 |
| `parseTime("09:30")` | → 570 (자정 기준 분) |
| `formatTime(570)` | → "09:30" |

### SlotOptions

| 옵션 | 설명 |
|------|------|
| `start` / `end` | 운영 시작/종료 "HH:MM" |
| `slotMinutes` | 슬롯 1개 길이(분) |
| `intervalMinutes?` | 슬롯 시작 간격(기본 = slotMinutes) |
| `breaks?` | 제외할 휴식시간 `[{start,end}]` |
| `bookings?` | 기존 예약 `[{start,end}]` |
| `capacity?` | 슬롯당 동시 예약 수(기본 1) |

### Slot

```ts
{ start, end, startMin, endMin, available, booked }
```

## License

Apache-2.0
