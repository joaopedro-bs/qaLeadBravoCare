# Observed API contracts (authorized discovery, 2026-10-08 23:02-23:04 -03)

Authorization: user stage-2 brief. Admin account from the assignment, supplied via env vars, never written.
Raw redacted transcripts:
- `api-responses/20261008-2302-contract-discovery-run1.json` (run 1, tag `qablso3vk8`)
- `api-responses/20261008-2303-contract-discovery-run2.json` (run 2, tag `qabnbvjzvo`)

Scripts: `notes/20261008-2302-contract-discovery-run1.mjs`, `notes/20261008-2303-contract-discovery-run2.mjs`.

Redaction:
- Username, password and token values are replaced with `[REDACTED]`.
- Other users' bookings and messages are recorded only as counts plus key/type shape.
- Only this run's own synthetic records appear in full.

Path provenance:
- Paths seen in the front-end bundles: `/api/auth/login`, `/api/auth/validate`, `/api/auth/logout`, `POST /api/booking`, `POST /api/message`, `/api/report/room/{id}`, `/api/room`.
- The admin page bundles could not be reached without login (`notes/20261008-2259-admin-bundle-static-analysis.txt`).
- These were hypotheses from prior knowledge of the open-source Restful Booker Platform: `GET /api/booking?roomid=`, `GET/DELETE /api/booking/{id}`, `GET /api/message`, `GET/DELETE /api/message/{id}`.
- Every one of those hypotheses was CONFIRMED by the live responses below. Nothing in this note is unobserved.

## Auth

| Call | Observed |
|---|---|
| `POST /api/auth/login` `{username,password}` | 200 `{"token":"<redacted>"}`. No `set-cookie` header. |
| Using the token | Sent as request cookie `token=<value>`, it authorizes `GET /api/booking?roomid=` (200). Without it: 401 (stage 0 evidence). |
| `POST /api/auth/validate` with body `{}` + cookie | 401 `{"error":"No token provided"}` |
| `POST /api/auth/validate` with body `{token}` | 200 `{"valid":true}` |
| `POST /api/auth/logout` with body `{}` | 400 `{"message":"Token is required"}` |
| `POST /api/auth/logout` with body `{token}` | 200 `{"success":true}` |
| **After a successful logout** | `validate` with the same token -> 200 `{"valid":true}`, and `GET /api/booking?roomid=2` with the token -> 200. **The token was not revoked by logout.** Possible security finding; product intent unknown. |

## Booking

| Call | Observed |
|---|---|
| `POST /api/booking` valid (firstname 6 chars, lastname 10, email, phone 11 digits, far-future 2 nights) | **201**. Body echoes the booking: `{bookingid:number, roomid, firstname, lastname, depositpaid, bookingdates{checkin,checkout}}`. Email and phone are NOT echoed. |
| Same room + same dates again | **409** `{"error":"Failed to create booking"}`. Nothing created. |
| Invalid payload (blank names, bad email, short phone, reversed dates) | **400** `{"errors":[...]}`. Messages: "size must be between 3 and 18" (firstname), "size must be between 3 and 30" (lastname), "size must be between 11 and 21" (phone), "Firstname should not be blank", "Lastname should not be blank", "must be a well-formed email address". Reversed dates produced no specific date error (not distinguishable). |
| firstname `Qa` (2 chars) | 400 `{"errors":["size must be between 3 and 18"]}`. This was a test-data error in run 1, not a product issue. |
| `GET /api/report/room/{id}` after create | The report count went 2 -> 3 and includes the new window (`title` for others' entries: "Unavailable"). |
| `GET /api/booking?roomid={id}` (auth) | 200 `{"bookings":[{bookingid, roomid, firstname, lastname, depositpaid, bookingdates}]}`. The own booking was found by tag. |
| `GET /api/booking/{id}` (auth, own) | 200, same shape |
| `DELETE /api/booking/{id}` (auth, own) | **202**, empty body. A follow-up `GET` returns **404**. |

## Message

| Call | Observed |
|---|---|
| `POST /api/message` valid `{name,email,phone,subject,description}` | **200** `{"success":true}`. No id returned. |
| Invalid (blanks, bad email, short phone) | **400**, body is a **bare JSON array** of strings (different from booking's `{errors:[]}`): "Subject may not be blank", "Name may not be blank", "Phone must be between 11 and 21 characters.", "Message may not be blank", "Message must be between 20 and 2000 characters.", "Subject must be between 5 and 100 characters.", "must be a well-formed email address". |
| `GET /api/message` (auth) | 200 `{"messages":[{id, name, subject, read}]}`. The own message was found by tag in `subject`/`name`. |
| `GET /api/message/{id}` (auth, own) | 200 `{messageid, name, email, phone, subject, description}`. Note `messageid` here vs `id` in the list. |
| `DELETE /api/message/{id}` (auth, own) | **202**. The list afterwards has 0 own records. |

## Writes performed and cleanup

| Run | Write | Result | Cleanup |
|---|---|---|---|
| 1 | booking invalid | 400, nothing created | n/a |
| 1 | booking create (firstname too short) | 400, nothing created | n/a |
| 1 | booking overlap attempt | 400, nothing created | n/a |
| 1 | message invalid | 400, nothing created | n/a |
| 1 | message create (tag qablso3vk8) | 200 | id 3 proven by tag -> DELETE 202 -> 0 own remaining |
| 2 | booking create (tag qabnbvjzvo) | 201 id 5 | DELETE 202 -> GET 404 -> 0 own remaining |
| 2 | booking overlap | 409, nothing created | n/a |

- No rooms were created.
- No other users' records were modified.
- `GET /api/message/3` (own) may have set `read=true` on that record. It was deleted afterwards.
- One admin session token from each run still exists server-side, because logout does not revoke tokens (see above).

## Other

- `GET /admin/rooms`, `/admin/message`, `/admin/report`, `/admin/branding` return 200 HTML; these are admin nav routes found in the home bundle.
- One guessed route, `GET /admin/rooms/1`, was requested in error and returned 404. Guessed routes were not tried again.
- Booking ids were low (5) and the message count was 3: consistent with a recent demo reset (not proven).
