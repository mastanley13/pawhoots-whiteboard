# Boarding Backend API — Contracts

Base path: `/api/boarding` (configurable in frontend via `VITE_BOARDING_API_BASE`; dev proxy target via `BOARDING_PROXY_TARGET` in `vite.config.ts`).

Auth: implement per environment (cookie/session or bearer). Not enforced by the client in MVP.

---

## GET /inventory
- Query: `date=YYYY-MM-DD`
- Returns: `200 OK`
```
{
  "runs": [
    { "code": "LL1", "areaCode": "LL", "capacity": 1, "subSlots": null, "linkedCodes": null, "notes": null }
  ],
  "stays": [
    {
      "id": "LL1-08",
      "petId": "abc",
      "petName": "Luna",
      "guardian": "Smith Family",
      "runCode": "LL1",
      "startAt": "2025-10-29T08:00:00.000Z",
      "endAt": "2025-10-29T19:00:00.000Z",
      "status": "checked_in",
      "addOns": ["groom"],
      "arrivalToday": true,
      "departureToday": false,
      "notes": "Sensitive stomach"
    }
  ]
}
```

Errors
- `400` invalid date
- `500` server error

---

## POST /move
- Body:
```
{ "stayId": "LL1-08", "targetRun": "LL2" }
```
- Returns: `200 OK` `{ "ok": true }`

Errors
- `400` invalid params
- `409` capacity/full
- `404` not found
- `500` server error

---

## POST /note
- Body:
```
{ "stayId": "LL1-08", "notes": "Allergic to chicken", "date": "2025-10-29" }
```
- Returns: `200 OK` `{ "ok": true }`

Errors
- `400` invalid params
- `404` stay not found
- `500` server error

---

## POST /status
- Body:
```
{ "stayId": "LL1-08", "status": "checked_in", "date": "2025-10-29" }
```
- Returns: `200 OK` `{ "ok": true }`

Errors
- `400` invalid params/status
- `404` stay not found
- `500` server error

---

## Notes
- All times are ISO-8601 strings in UTC; client converts to `Date` and formats locally.
- `areaCode` limited to: LL, TK, RR, DD, KK, CC, ER, GR, TC.
- Future: add endpoints for check-in/out and notes update.
