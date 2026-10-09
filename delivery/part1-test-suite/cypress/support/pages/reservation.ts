import type { BookingRequest, Dates } from '../api-types';

const DAY_MS = 86400000;
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
  'September', 'October', 'November', 'December'];
const EDGE_TOLERANCE_PX = 2;

// Where the URL pre-selection sits relative to the target month view.
export type InitialPlacement = 'inside-target-month' | 'outside-target-month';
type Point = { x: number; y: number };
type Segment = { row: number; first: number; last: number; left: number; right: number };
type PointerTrace = { type: string; trusted: boolean; inTargetRow: boolean }[];

const shift = (date: string, days: number) =>
  new Date(Date.parse(`${date}T12:00:00Z`) + days * DAY_MS).toISOString().slice(0, 10);
const monthLabel = (index: number) => `${MONTHS[index % 12]} ${Math.floor(index / 12)}`;

/**
 * URL window that always differs from the target.
 * inside: same month, different week row (one week earlier, or two weeks later for days 1-7).
 * outside: 60 days earlier, which can never appear in the target month view (max 6 leading days).
 */
export function initialWindow(target: Dates, placement: InitialPlacement): Dates {
  const day = new Date(`${target.checkin}T12:00:00Z`).getUTCDate();
  const offset = placement === 'outside-target-month' ? -60 : day > 7 ? -7 : 14;
  return { checkin: shift(target.checkin, offset), checkout: shift(target.checkout, offset) };
}

export function reservationUrl(roomid: number, target: Dates, placement: InitialPlacement = 'inside-target-month') {
  // The URL creates a Selected event over its initial dates. The calendar drag must replace it,
  // and the final request must prove the change.
  const initial = initialWindow(target, placement);
  return `/reservation/${roomid}?checkin=${initial.checkin}&checkout=${initial.checkout}`;
}

function cellGeometry(view: Element, day: number) {
  const label = String(day).padStart(2, '0');
  const cell = Array.from(view.querySelectorAll('.rbc-date-cell:not(.rbc-off-range)'))
    .find(c => c.textContent?.trim() === label);
  if (!cell?.parentElement) throw new Error(`[calendar-precondition] in-month date cell ${label} not found`);
  const row = cell.closest('.rbc-month-row');
  const col = Array.from(cell.parentElement.children).indexOf(cell);
  const bg = row?.querySelectorAll('.rbc-day-bg')[col];
  if (!row || !bg) throw new Error(`[calendar-precondition] day background for ${label} not found`);
  return { row, rowIndex: Array.from(view.querySelectorAll('.rbc-month-row')).indexOf(row), col, bg,
    rect: bg.getBoundingClientRect() };
}

// Selected segments in the visible month view, mapped to row index and cell columns.
function selectedSegments(view: Element): Segment[] {
  const rows = Array.from(view.querySelectorAll('.rbc-month-row'));
  return Array.from(view.querySelectorAll('.rbc-event'))
    .filter(e => e.textContent?.includes('Selected'))
    .map(e => {
      const row = e.closest('.rbc-month-row');
      // The segment wrapper carries the flex-basis that maps the event onto day columns.
      const box = (e.closest('.rbc-row-segment') ?? e).getBoundingClientRect();
      const cells = row ? Array.from(row.querySelectorAll('.rbc-day-bg')).map(c => c.getBoundingClientRect()) : [];
      const at = (x: number) => cells.findIndex(c => x >= c.left && x <= c.right);
      return { row: row ? rows.indexOf(row) : -1, first: at(box.left + 3), last: at(box.right - 3),
        left: Math.round(box.left * 100) / 100, right: Math.round(box.right * 100) / 100 };
    });
}

function waitForStableGeometry() {
  let previous = '';
  let stableReads = 0;
  cy.window({ log: false }).then(win => {
    cy.get('.rbc-month-view').should($view => {
      const r = $view[0].getBoundingClientRect();
      const sample = [r.x, r.y, r.width, r.height, win.scrollX, win.scrollY].join(',');
      stableReads = sample === previous ? stableReads + 1 : 0;
      previous = sample;
      expect(stableReads, '[calendar-geometry] month view rect and scroll unchanged on consecutive reads')
        .to.be.at.least(2);
    });
  });
}

// Real browser input through Cypress's Chrome DevTools Protocol bridge (Electron, Chrome, Edge).
function cdpMouse(type: 'mouseMoved' | 'mousePressed' | 'mouseReleased', p: Point, buttons: number) {
  return Cypress.automation('remote:debugger:protocol', {
    command: 'Input.dispatchMouseEvent',
    params: { type, x: p.x, y: p.y, button: type === 'mouseMoved' ? 'none' : 'left', buttons,
      clickCount: type === 'mouseMoved' ? 0 : 1 }
  }).catch((error: Error) => {
    throw new Error(`[native-pointer] CDP Input.dispatchMouseEvent ${type} failed in ${Cypress.browser.name}: ${error.message}`);
  });
}

function dragNative(startDay: number, lastDay: number) {
  cy.window({ log: false }).then(autWin => {
    expect(Cypress.isBrowser({ family: 'chromium' }),
      '[native-pointer] CDP input requires a Chromium-family browser (Electron, Chrome, Edge)').to.eq(true);
    // CDP coordinates are relative to the top-level runner page; the app runs in the scaled AUT iframe.
    const iframe = window.top?.document.querySelector<HTMLIFrameElement>('iframe.aut-iframe');
    expect(!!iframe && iframe.contentWindow === autWin, '[native-pointer] runner AUT iframe located').to.eq(true);
    const frame = iframe!.getBoundingClientRect();
    const scale = frame.width / autWin.innerWidth;
    expect(Math.abs(scale - frame.height / autWin.innerHeight), '[native-pointer] uniform AUT scale').to.be.lessThan(0.01);
    const view = autWin.document.querySelector('.rbc-month-view');
    if (!view) throw new Error('[calendar-precondition] month view not rendered');
    // Geometry is re-read here, in the same callback that dispatches, after navigation and settling.
    const a = cellGeometry(view, startDay);
    const b = cellGeometry(view, lastDay);
    expect(b.row === a.row, '[calendar-precondition] check-in and last night share one month row').to.eq(true);
    const bottomCentre = (r: DOMRect): Point => ({ x: r.x + r.width / 2, y: r.y + r.height - 4 });
    const points = { 'check-in': bottomCentre(a.rect), 'last-night': bottomCentre(b.rect) };
    for (const [label, p] of Object.entries(points)) {
      const hit = autWin.document.elementFromPoint(p.x, p.y);
      expect(!!hit && hit.closest('.rbc-month-view') === view && hit.closest('.rbc-month-row') === a.row &&
        !hit.closest('.rbc-event'),
        `[calendar-hit-target] ${label} point (${p.x.toFixed(1)}, ${p.y.toFixed(1)}) hits the target month row; ` +
        `got ${hit?.getAttribute('class') ?? 'null'}`).to.eq(true);
    }
    const toTop = (p: Point): Point => ({ x: frame.left + p.x * scale, y: frame.top + p.y * scale });
    const from = toTop(points['check-in']);
    const to = toTop(points['last-night']);
    // Passive trace of delivered events; no application state is read or written.
    const trace: PointerTrace = [];
    const listener = (e: Event) => {
      const target = e.target as Element | null;
      trace.push({ type: e.type, trusted: e.isTrusted, inTargetRow: target?.closest?.('.rbc-month-row') === a.row });
    };
    for (const type of ['mousedown', 'mouseup']) autWin.document.addEventListener(type, listener, true);
    let chain = cdpMouse('mouseMoved', from, 0).then(() => cdpMouse('mousePressed', from, 1));
    for (let step = 1; step <= 12; step++) {
      const p = { x: from.x + (to.x - from.x) * step / 12, y: from.y + (to.y - from.y) * step / 12 };
      chain = chain.then(() => cdpMouse('mouseMoved', p, 1));
    }
    return chain.then(() => cdpMouse('mouseReleased', to, 0)).finally(() => {
      for (const type of ['mousedown', 'mouseup']) autWin.document.removeEventListener(type, listener, true);
    }).then(() => trace);
  }).then((trace: PointerTrace) => {
    expect(trace.some(e => e.type === 'mousedown' && e.trusted && e.inTargetRow),
      '[native-pointer] trusted mousedown delivered to the target month row').to.eq(true);
    expect(trace.some(e => e.type === 'mouseup' && e.trusted),
      '[native-pointer] trusted mouseup delivered to the app').to.eq(true);
  });
}

export function selectDates(dates: Dates, placement: InitialPlacement) {
  const start = new Date(`${dates.checkin}T12:00:00Z`);
  const lastNight = new Date(Date.parse(`${dates.checkout}T12:00:00Z`) - DAY_MS);
  expect(lastNight >= start && lastNight.getUTCMonth() === start.getUTCMonth(),
    '[calendar-precondition] at least one night, check-in and last night in one month').to.eq(true);
  const targetMonth = start.getUTCFullYear() * 12 + start.getUTCMonth();
  cy.get('.rbc-calendar').should('be.visible');
  cy.get('.rbc-toolbar-label').invoke('text').then(text => {
    const [name, year] = text.trim().split(/\s+/);
    const current = Number(year) * 12 + MONTHS.indexOf(name);
    expect(MONTHS.includes(name) && Number.isInteger(Number(year)),
      `[calendar-precondition] parse toolbar label "${text.trim()}"`).to.eq(true);
    const moves = targetMonth - current;
    expect(moves, 'calendar navigation months').to.be.within(0, 37);
    for (let i = 1; i <= moves; i++) {
      cy.contains('.rbc-toolbar button', /^Next$/).click();
      cy.get('.rbc-toolbar-label').should('have.text', monthLabel(current + i));
    }
  });
  cy.get('.rbc-toolbar-label').should('have.text', monthLabel(targetMonth));
  cy.get('.rbc-month-view').then($view => {
    cellGeometry($view[0], start.getUTCDate()).row.scrollIntoView({ block: 'center', inline: 'nearest' });
  });
  waitForStableGeometry();

  let before: Segment[] = [];
  cy.get('.rbc-month-view').then($view => {
    before = selectedSegments($view[0]);
    const a = cellGeometry($view[0], start.getUTCDate());
    const b = cellGeometry($view[0], lastNight.getUTCDate());
    if (placement === 'outside-target-month') {
      expect(before, '[calendar-precondition] no Selected event in the target month view before the drag').to.have.length(0);
    } else {
      expect(before.length, '[calendar-precondition] URL Selected event visible in the target month view before the drag')
        .to.be.greaterThan(0);
      expect(before.some(s => s.row === a.rowIndex && s.first === a.col && s.last === b.col),
        '[calendar-precondition] initial Selected differs from the target cells').to.eq(false);
    }
    Cypress.log({ name: 'pre-drag', message: JSON.stringify(before) });
  });

  dragNative(start.getUTCDate(), lastNight.getUTCDate());

  cy.get('.rbc-month-view').should($view => {
    const a = cellGeometry($view[0], start.getUTCDate());
    const b = cellGeometry($view[0], lastNight.getUTCDate());
    const after = selectedSegments($view[0]);
    expect(after, '[calendar-selection] exactly one Selected segment in the month view after the drag').to.have.length(1);
    const [s] = after;
    expect(s.row, '[calendar-selection] Selected sits in the row containing the target check-in').to.eq(a.rowIndex);
    expect(Math.abs(s.left - a.rect.left),
      `[calendar-selection] Selected left edge ${s.left} aligns with check-in cell ${a.rect.left} (±${EDGE_TOLERANCE_PX}px)`)
      .to.be.at.most(EDGE_TOLERANCE_PX);
    expect(Math.abs(s.right - b.rect.right),
      `[calendar-selection] Selected right edge ${s.right} aligns with last-night cell ${b.rect.right} (±${EDGE_TOLERANCE_PX}px)`)
      .to.be.at.most(EDGE_TOLERANCE_PX);
    expect([s.first, s.last], '[calendar-selection] Selected spans exactly check-in..last-night columns')
      .to.deep.eq([a.col, b.col]);
    expect(before.some(p => p.row === s.row && p.first === s.first && p.last === s.last),
      '[calendar-selection] selection differs from the pre-drag snapshot').to.eq(false);
  });
}

export function openForm() {
  cy.get('#doReservation').should('be.visible').click();
  cy.get('input.room-firstname').should('be.visible');
  cy.get('input.room-lastname').should('be.visible');
  cy.get('input.room-email').should('be.visible');
  cy.get('input.room-phone').should('be.visible');
}

export function fillGuest(payload: BookingRequest) {
  cy.get('input.room-firstname').type(payload.firstname, { log: false });
  cy.get('input.room-lastname').type(payload.lastname, { log: false });
  cy.get('input.room-email').type(payload.email, { log: false });
  cy.get('input.room-phone').type(payload.phone, { log: false });
}
