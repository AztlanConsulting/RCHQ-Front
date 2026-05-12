/**
 * Month grid (and list-month) event chip — replace markup when you define the real card.
 */
const DayGridCard = ({ arg }) => {
  console.log("arg: ", arg)

  const getStartHour = (timestamp) => {
    return "08:00"
  }

  return (
    <div className={`fc-custom-daygrid-card bg-color-[${arg.event.backgroundColor}] px-1.5 py-0.5 rounded text-xs flex justify-between w-full min-w-0`}>
      <span className="font-medium truncate block">{arg.event.title}</span>
      {arg.timeText ? (
        <span className="opacity-90 text-[0.65rem]">{getStartHour(arg.timeText)}</span>
      ) : null}
    </div>
  )
};

export default DayGridCard;
