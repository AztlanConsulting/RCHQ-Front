const DayTimeCard = ({ arg }) => (
    <div className="fc-custom-day-card px-1.5 py-1 text-sm min-w-0">
        <div className="font-semibold truncate">{arg.event.title}</div>
        {arg.timeText ? (
            <div className="text-xs opacity-90">{arg.timeText}</div>
        ) : null}
    </div>
);

export default DayTimeCard;
