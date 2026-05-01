import React from "react";
import BaseCalendar from "../components/organism/baseCalendar";

const calendario = () => {
    const calendarRef = React.useRef(null);

    return (
        <div>
            <BaseCalendar
                calendarRef={calendarRef}
                initialDate={"2026-04-25"}
            />
        </div>
    );
};

export default calendario;