import React from "react";

const Chip = ({ active = true, className = "" }) => {
  return (
    <span
      role="status"
      aria-label={active ? "Empleado activo" : "Empleado inactivo"}
      className={[
        "inline-flex max-w-full items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide shadow-sm backdrop-blur-md",
        active
          ? "border-emerald-200/80 bg-emerald-50/95 text-emerald-900"
          : "border-slate-200/90 bg-white/95 text-slate-600",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span
        className={[
          "h-2 w-2 shrink-0 rounded-full ring-2 ring-white",
          active ? "bg-emerald-500 shadow-[0_0_0_1px_rgba(16,185,129,0.35)]" : "bg-slate-400 shadow-[0_0_0_1px_rgba(148,163,184,0.4)]",
        ].join(" ")}
        aria-hidden
      />
      <span className="leading-none">{active ? "Activo" : "Inactivo"}</span>
    </span>
  );
};

export default Chip;
