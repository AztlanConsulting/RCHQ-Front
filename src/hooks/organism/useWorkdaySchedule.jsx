import { useState, useRef, useCallback, useEffect } from "react";

export const DAYS = [
  { id: 1, name: "Lunes",     short: "Lun" },
  { id: 2, name: "Martes",    short: "Mar" },
  { id: 3, name: "Miércoles", short: "Mié" },
  { id: 4, name: "Jueves",    short: "Jue" },
  { id: 5, name: "Viernes",   short: "Vie" },
  { id: 6, name: "Sábado",    short: "Sáb" },
  { id: 7, name: "Domingo",   short: "Dom" },
];

export const START_HOUR = 6;
export const END_HOUR = 23;
export const SLOTS = (END_HOUR - START_HOUR) * 2;

export const REF_COLORS = [
  { bg: "rgba(29,158,117,0.18)",  border: "#1D9E75", light: "rgba(29,158,117,0.08)",  badge: "#0F6E56" },
  { bg: "rgba(212,83,126,0.18)",  border: "#D4537E", light: "rgba(212,83,126,0.08)",  badge: "#993556" },
  { bg: "rgba(186,117,23,0.18)",  border: "#BA7517", light: "rgba(186,117,23,0.08)",  badge: "#854F0B" },
  { bg: "rgba(127,119,221,0.18)", border: "#7F77DD", light: "rgba(127,119,221,0.08)", badge: "#534AB7" },
  { bg: "rgba(226,75,74,0.18)",   border: "#E24B4A", light: "rgba(226,75,74,0.08)",   badge: "#A32D2D" },
];

export function slotToTime(slot) {
  const totalMin = START_HOUR * 60 + slot * 30;
  const h = Math.floor(totalMin / 60).toString().padStart(2, "0");
  const m = (totalMin % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

export function timeToSlot(timeStr) {
  if (!timeStr) return null;
  const [h, m] = timeStr.split(":").map(Number);
  return (h - START_HOUR) * 2 + (m >= 30 ? 1 : 0);
}

export function workdayToSelection(workdays) {
  const sel = {};
  if (!workdays) return sel;
  workdays.forEach((w) => {
    const dayIndex = DAYS.findIndex((d) => d.name.toLowerCase() === w.name?.toLowerCase());
    if (dayIndex === -1) return;
    if (!w.selected) return;
    const startSlot = timeToSlot(w.start);
    const endSlot = timeToSlot(w.end);
    if (startSlot !== null && endSlot !== null && endSlot > startSlot) {
      sel[dayIndex] = [startSlot, endSlot - 1];
    }
  });
  return sel;
}

function selectionToWorkdays(selection, allWorkdays) {
  return allWorkdays.map((wd) => {
    const dayIndex = DAYS.findIndex((d) => d.name.toLowerCase() === wd.name?.toLowerCase());
    const range = selection[dayIndex];
    if (!range || dayIndex === -1) {
      return { ...wd, selected: false };
    }
    return {
      ...wd,
      selected: true,
      start: slotToTime(range[0]),
      end: slotToTime(range[1] + 1),
    };
  });
}

export const useWorkdaySchedule = (adminForm, setAdminFormState, houseEmployees = []) => {
  const [selection, setSelection] = useState(() =>
    workdayToSelection(adminForm.selectedWorkdays)
  );
  const [visibleRefs, setVisibleRefs] = useState(() =>
    houseEmployees.map((_, i) => i)
  );
  const [tooltip, setTooltip] = useState(null);
  
  const isDragging = useRef(false);
  const dragDay = useRef(null);
  const dragStart = useRef(null);
  const dragMode = useRef("add");

  const commitSelection = useCallback(
    (newSel) => {
      setSelection(newSel);
      setAdminFormState((prev) => ({
        ...prev,
        selectedWorkdays: selectionToWorkdays(newSel, prev.selectedWorkdays),
      }));
    },
    [setAdminFormState]
  );

  const getCell = useCallback((target) => {
    const td = target.closest("[data-day]");
    if (!td) return null;
    return { day: +td.dataset.day, slot: +td.dataset.slot };
  }, []);

  const handlePointerDown = useCallback(
    (e) => {
      const c = getCell(e.target);
      if (!c) return;
      isDragging.current = true;
      dragDay.current = c.day;
      dragStart.current = c.slot;
      const cur = selection[c.day];
      dragMode.current =
        cur && c.slot >= cur[0] && c.slot <= cur[1] ? "remove" : "add";
      const next = { ...selection };
      if (dragMode.current === "remove") {
        next[c.day] = null;
      } else {
        next[c.day] = [c.slot, c.slot];
      }
      commitSelection(next);
    },
    [selection, commitSelection, getCell]
  );

  const handlePointerMove = useCallback(
    (e) => {
      const c = getCell(e.target);
      if (c) {
        const cur = selection[c.day];
        setTooltip(
          cur
            ? {
                day: DAYS[c.day]?.name,
                range: `${slotToTime(cur[0])} – ${slotToTime(cur[1] + 1)}`,
                x: e.clientX,
                y: e.clientY,
              }
            : null
        );
      } else {
        setTooltip(null);
      }
      if (!isDragging.current || !c || c.day !== dragDay.current) return;
      if (dragMode.current === "add") {
        const lo = Math.min(dragStart.current, c.slot);
        const hi = Math.max(dragStart.current, c.slot);
        const next = { ...selection, [c.day]: [lo, hi] };
        commitSelection(next);
      }
    },
    [selection, commitSelection, getCell]
  );

  const handlePointerUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  const handleTouchMove = useCallback(
    (e) => {
      if (!isDragging.current) return;
      e.preventDefault();
      const touch = e.touches[0];
      const el = document.elementFromPoint(touch.clientX, touch.clientY);
      if (!el) return;
      const c = getCell(el);
      if (c && dragMode.current === "add" && c.day === dragDay.current) {
        const lo = Math.min(dragStart.current, c.slot);
        const hi = Math.max(dragStart.current, c.slot);
        const next = { ...selection, [c.day]: [lo, hi] };
        commitSelection(next);
      }
    },
    [selection, commitSelection, getCell]
  );

  useEffect(() => {
    document.addEventListener("mouseup", handlePointerUp);
    document.addEventListener("touchend", handlePointerUp);
    return () => {
      document.removeEventListener("mouseup", handlePointerUp);
      document.removeEventListener("touchend", handlePointerUp);
    };
  }, [handlePointerUp]);

  const toggleRef = (idx) => {
    setVisibleRefs((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const copyRef = (idx) => {
    const emp = houseEmployees[idx];
    if (!emp) return;
    const refSel = {};
    (emp.workdays || []).forEach((w) => {
      const dayIndex = DAYS.findIndex((d) => d.name.toLowerCase() === w.name?.toLowerCase());
      if (dayIndex === -1) return;
      const startSlot = timeToSlot(w.start);
      const endSlot = timeToSlot(w.end);
      if (startSlot !== null && endSlot !== null && endSlot > startSlot) {
        refSel[dayIndex] = [startSlot, endSlot - 1];
      }
    });
    commitSelection(refSel);
  };

  const clearDay = (dayIdx) => {
    const next = { ...selection, [dayIdx]: null };
    commitSelection(next);
  };

  const summaryParts = DAYS.map((d, i) => {
    const s = selection[i];
    if (!s) return null;
    return `${d.short} ${slotToTime(s[0])}–${slotToTime(s[1] + 1)}`;
  }).filter(Boolean);

  return {
    selection,
    visibleRefs,
    tooltip,
    summaryParts,
    setTooltip,
    handlePointerDown,
    handlePointerMove,
    handleTouchMove,
    toggleRef,
    copyRef,
    clearDay
  };
};