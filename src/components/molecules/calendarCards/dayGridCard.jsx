/**
 * Month grid (and list-month) event chip — replace markup when you define the real card.
 */
/** +6h: DB wall time vs UTC instant mismatch — replace with proper timezone when backend is aligned. */
const DISPLAY_OFFSET_MS = 6 * 60 * 60 * 1000;

const getStartHour = (timestamp) => {
  if (timestamp == null) return "";
  const base =
    timestamp instanceof Date ? new Date(timestamp.getTime()) : new Date(timestamp);
  if (Number.isNaN(base.getTime())) return "";
  const shifted = new Date(base.getTime() + DISPLAY_OFFSET_MS);
  const h = shifted.getHours();
  const m = shifted.getMinutes();
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

const DayGridCard = ({ arg }) => {
  const start = arg.event.start;
  const timeLabel = start != null ? getStartHour(start) : "";

  return (
    <div
      className="fc-card cursor-pointer px-1.5 py-0.5 rounded text-xs flex justify-between items-center w-full min-w-0 text-white"
      style={{
        backgroundColor: arg.event.backgroundColor,
        borderColor: arg.event.borderColor ?? arg.event.backgroundColor,
      }}
    >
      <span className="fc-card font-medium truncate block">{arg.event.title}</span>
      {timeLabel ? (
        <span className="fc-card opacity-90 text-[0.65rem] shrink-0 ml-1">{timeLabel}</span>
      ) : null}
    </div>
  );
};

export default DayGridCard;
