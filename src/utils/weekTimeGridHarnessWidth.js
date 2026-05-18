export const TIMEGRID_COLUMN_OVERLAP_TARGET_WIDTH_PCT = 66;

const parsePct = (value) => {
    if (value == null || value === "") return 0;
    if (typeof value !== "string") return null;
    const s = value.trim();
    if (!s.endsWith("%")) return null;
    const n = Number.parseFloat(s);
    return Number.isFinite(n) ? n : null;
};

export function widenTimeGridColumnEventHarness(info) {
    const vt = info.view.type;
    if (vt !== "timeGridWeek" && vt !== "timeGridDay") return;

    const harness = info.el.closest(".fc-timegrid-event-harness");
    if (!harness?.style) return;

    const L = parsePct(harness.style.left);
    const R = parsePct(harness.style.right);
    if (L === null || R === null) return;

    const w = 100 - L - R;
    const target = TIMEGRID_COLUMN_OVERLAP_TARGET_WIDTH_PCT;
    const nearHalfWidth = w >= 36 && w <= 54;
    if (!(w > 0 && w < target - 0.25 && nearHalfWidth)) return;

    const delta = target - w;

    if (L === 0 && R > 0) {
        harness.style.right = `${Math.max(0, R - delta)}%`;
    } else if (R === 0 && L > 0) {
        harness.style.left = `${Math.max(0, L - delta)}%`;
    } else if (L > 0 && R > 0) {
        harness.style.left = `${Math.max(0, L - delta / 2)}%`;
        harness.style.right = `${Math.max(0, R - delta / 2)}%`;
    }
}
