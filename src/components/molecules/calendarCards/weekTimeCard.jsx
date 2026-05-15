const WeekTimeCard = ({ arg }) => (
    <div className="fc-custom-week-card px-1 py-0.5 text-xs min-w-0">
        <div className="font-medium truncate">{arg.event.title}</div>
        {arg.timeText ? (
            <div className="opacity-90 truncate">{arg.timeText}</div>
        ) : null}
    </div>
);

export default WeekTimeCard;
