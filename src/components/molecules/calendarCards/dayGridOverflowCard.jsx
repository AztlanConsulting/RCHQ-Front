const DayGridOverflowCard = ({ count }) => {
    if (count == null || count < 1) return null;

    return <span className="fc-dayGridOverflowCard">+{count} más</span>;
};

export default DayGridOverflowCard;
