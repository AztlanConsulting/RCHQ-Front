import { 
  useWorkdaySchedule, 
  DAYS, 
  SLOTS, 
  REF_COLORS, 
  slotToTime,
  timeToSlot
} from "@/hooks/organism/useWorkdaySchedule";

const WorkdayScheduleGrid = ({ adminForm, setAdminFormState, houseEmployees = [] }) => {
  const {
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
  } = useWorkdaySchedule(adminForm, setAdminFormState, houseEmployees);

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* ── Referencias de Empleados ── */}
      {houseEmployees.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Horarios de referencia (empleados en esta casa)
          </p>
          <div className="flex flex-wrap gap-2">
            {houseEmployees.map((emp, idx) => {
              const color = REF_COLORS[idx % REF_COLORS.length];
              const active = visibleRefs.includes(idx);
              return (
                <div key={emp.employeeId || idx} className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => toggleRef(idx)}
                    className="flex items-center gap-1.5 px-2 py-1 sm:px-2.5 rounded-lg text-[10px] sm:text-xs font-semibold transition-all"
                    style={{
                      background: active ? color.bg : "transparent",
                      border: `1.5px solid ${active ? color.border : "var(--tw-border-opacity, #e2e8f0)"}`,
                      color: active ? color.badge : "#94a3b8",
                    }}
                  >
                    <span
                      className="inline-block w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: active ? color.border : "#cbd5e1" }}
                    />
                    {emp.name} {emp.surname}
                  </button>
                  {active && (
                    <button
                      type="button"
                      onClick={() => copyRef(idx)}
                      title={`Copiar horario de ${emp.name}`}
                      className="px-2 py-1 rounded-lg text-[10px] sm:text-xs border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
                    >
                      Copiar
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Grid Principal de Horarios ── */}
      <div
        className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm relative w-full custom-scrollbar"
        onMouseLeave={() => setTooltip(null)}
      >
        <table
          className="w-full min-w-[450px] sm:min-w-[500px]"
          style={{ 
            borderCollapse: "separate", 
            borderSpacing: 0,
            tableLayout: "fixed", 
            userSelect: "none", 
            WebkitUserSelect: "none" 
          }}
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onTouchStart={(e) => {
            const touch = e.touches[0];
            const el = document.elementFromPoint(touch.clientX, touch.clientY);
            if (el) handlePointerDown({ target: el });
          }}
          onTouchMove={handleTouchMove}
        >
          <thead>
            <tr>
              <th 
                className="w-10 min-w-[40px] sm:w-12 sm:min-w-[48px]"
                style={{ 
                  background: "#f8fafc", 
                  borderBottom: "1px solid #e2e8f0",
                  borderRight: "1px solid #e2e8f0",
                  position: "sticky", 
                  left: 0, 
                  top: 0,
                  zIndex: 30 
                }} 
              />
              {DAYS.map((d, i) => (
                <th
                  key={d.id}
                  style={{
                    minWidth: 60,
                    padding: "4px 2px",
                    fontWeight: 600,
                    color: "#64748b",
                    textAlign: "center",
                    background: "#f8fafc",
                    borderBottom: "1px solid #e2e8f0",
                    borderRight: "1px solid #e2e8f0",
                    position: "sticky",
                    top: 0,
                    zIndex: 20
                  }}
                >
                  <div className="flex flex-col items-center gap-0.5 text-[10px] sm:text-xs">
                    {d.short}
                    {selection[i] && (
                      <button
                        type="button"
                        onClick={() => clearDay(i)}
                        title="Quitar día"
                        style={{
                          fontSize: 9,
                          color: "#94a3b8",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: 0,
                          lineHeight: 1,
                        }}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: SLOTS + 1 }, (_, slotIdx) => {
              const isExtraRow = slotIdx === SLOTS; 
              const isHalf = slotIdx % 2 === 1;
              const showTime = !isHalf;
              const isHour = slotIdx % 2 === 0;

              return (
                <tr key={slotIdx}>
                  <td
                    className="w-10 min-w-[40px] sm:w-12 sm:min-w-[48px] text-[9px] sm:text-[10px]"
                    style={{
                      height: isExtraRow ? 14 : 22, 
                      color: "#94a3b8",
                      textAlign: "right",
                      paddingRight: 6,
                      background: "#f8fafc",
                      borderBottom: (isHour || isExtraRow) ? "1px solid #e2e8f0" : "1px dashed #f1f5f9",
                      borderRight: "1px solid #e2e8f0", 
                      verticalAlign: isExtraRow ? "top" : "middle",
                      cursor: "default",
                      position: "sticky", 
                      left: 0, 
                      zIndex: 10 
                    }}
                  >
                    {showTime ? slotToTime(slotIdx) : ""}
                  </td>
                  
                  {DAYS.map((d, dayIdx) => {
                    if (isExtraRow) {
                      return (
                        <td 
                          key={d.id} 
                          style={{ 
                            borderRight: "1px solid #e2e8f0", 
                            borderBottom: "1px solid #e2e8f0", 
                            background: "transparent",
                            pointerEvents: "none" 
                          }} 
                        />
                      );
                    }

                    const curSel = selection[dayIdx];
                    const isCurrent = curSel && slotIdx >= curSel[0] && slotIdx <= curSel[1];
                    const isCurrentStart = curSel && slotIdx === curSel[0];
                    const isCurrentEnd = curSel && slotIdx === curSel[1];

                    const refLayers = visibleRefs
                      .map((refIdx) => {
                        const emp = houseEmployees[refIdx];
                        if (!emp) return null;
                        
                        const wdObj = emp.workdays || [];
                        const wdSel = wdObj.find(w => w?.name?.toLowerCase() === d?.name?.toLowerCase());
                        
                        if (!wdSel || !wdSel.start || !wdSel.end) return null;

                        // ✅ Usamos la función timeToSlot para evitar que errores matemáticos rompan el bloque
                        const sSlot = timeToSlot(wdSel.start);
                        const eSlot = timeToSlot(wdSel.end) - 1;

                        if (sSlot !== null && eSlot !== null && slotIdx >= sSlot && slotIdx <= eSlot) {
                           return {
                             color: REF_COLORS[refIdx % REF_COLORS.length],
                             isStart: slotIdx === sSlot,
                             isEnd: slotIdx === eSlot,
                           };
                        }
                        return null;
                      })
                      .filter(Boolean);

                    return (
                      <td
                        key={d.id}
                        data-day={dayIdx}
                        data-slot={slotIdx}
                        style={{
                          height: 22,
                          position: "relative",
                          cursor: "crosshair",
                          borderRight: "1px solid #e2e8f0",
                          borderBottom: isHour ? "1px solid #e2e8f0" : "1px dashed #f1f5f9",
                          background: "transparent",
                        }}
                      >
                        {refLayers.map((layer, li) => (
                          <div
                            key={li}
                            style={{
                              position: "absolute",
                              inset: 0,
                              background: layer.color.bg,
                              borderTop: layer.isStart ? `2px solid ${layer.color.border}` : "none",
                              borderBottom: layer.isEnd ? `2px solid ${layer.color.border}` : "none",
                              pointerEvents: "none",
                              zIndex: 1,
                            }}
                          />
                        ))}
                        {isCurrent && (
                          <div
                            style={{
                              position: "absolute",
                              inset: 0,
                              background: "rgba(55,138,221,0.22)",
                              borderTop: isCurrentStart ? "2px solid #378ADD" : "none",
                              borderBottom: isCurrentEnd ? "2px solid #378ADD" : "none",
                              borderRadius:
                                isCurrentStart && isCurrentEnd ? 4
                                  : isCurrentStart ? "4px 4px 0 0"
                                  : isCurrentEnd ? "0 0 4px 4px"
                                  : 0,
                              pointerEvents: "none",
                              zIndex: 2,
                            }}
                          />
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Leyenda de Colores ── */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <div className="flex items-center gap-1 sm:gap-1.5">
          <span
            className="inline-block w-3 h-2 sm:w-4 sm:h-3 rounded-sm flex-shrink-0"
            style={{ background: "rgba(55,138,221,0.25)", borderTop: "2px solid #378ADD" }}
          />
          <span className="text-[10px] sm:text-xs text-slate-500">Empleado actual</span>
        </div>
        {visibleRefs.map((refIdx) => {
          const emp = houseEmployees[refIdx];
          const color = REF_COLORS[refIdx % REF_COLORS.length];
          return (
            <div key={refIdx} className="flex items-center gap-1 sm:gap-1.5">
              <span
                className="inline-block w-3 h-2 sm:w-4 sm:h-3 rounded-sm flex-shrink-0"
                style={{ background: color.bg, borderTop: `2px solid ${color.border}` }}
              />
              <span className="text-[10px] sm:text-xs text-slate-500">{emp?.name}</span>
            </div>
          );
        })}
      </div>

      {/* ── Resumen de Horas Seleccionadas ── */}
      {summaryParts.length > 0 && (
        <p className="text-[10px] sm:text-xs text-slate-400 leading-relaxed">
          {summaryParts.join(" · ")}
        </p>
      )}

      {/* ── Tooltip al pasar el mouse ── */}
      {tooltip && (
        <div
          style={{
            position: "fixed",
            left: tooltip.x + 14,
            top: tooltip.y - 32,
            background: "white",
            border: "0.5px solid #e2e8f0",
            borderRadius: 8,
            fontSize: 12,
            padding: "4px 10px",
            pointerEvents: "none",
            zIndex: 9999,
            whiteSpace: "nowrap",
            color: "#0f172a",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          {tooltip.day}: {tooltip.range}
        </div>
      )}
    </div>
  );
};

export default WorkdayScheduleGrid;