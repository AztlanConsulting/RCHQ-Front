/**
 * Summary row when a day has more events than dayMaxEvents (month grid).
 * RenderFullCalendar passes the link wrapper; this is only the inner label.
 */
const DayGridOverflowCard = ({ count }) => {
  if (count == null || count < 1) return null;

  return (
    <span className="fc-dayGridOverflow font-semibold tabular-nums">
      +{count} más
    </span>
  );
};

export default DayGridOverflowCard;
