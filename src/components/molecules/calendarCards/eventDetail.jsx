import Modal from "../../atoms/modal";
import Button from "../../atoms/button";
import Type from "../../atoms/type";


const EventDetail = (event) => {
    

    return (
        <div className="text-left ">
            {/* title */}
            <Type variant="page-title" className="mb-2" as="span">
                {event?.title}
            </Type>
            {/* scope */}
            <div className="flex items-center gap-4">
                {/* TODO: make small circle with background color */}
                <Type variant="subtitle">
                    {event?.scope}
                </Type>
            </div>
            {/* focus */}
            <div className="flex items-center gap-4 mb-4">
                {/* TODO: import and put icon */}
                <Type variant="subtitle">
                    {event?.focus}
                </Type>
            </div>
            {/* subtitle */}
            <Type variant="body" className="mb-4">
                {event?.subtitle}
            </Type>
            {/* date */}
            <div className="w-full flex items-center justify-between">
                <Type variant="metric-label" className="font-bold">Fecha:</Type>
                <p>{event?.date}</p>
            </div>
            {/* start */}
            <div className="w-full flex items-center justify-between">
                <Type variant="metric-label" className="font-bold">Inicio:</Type>
                <p>{event?.start}</p>
            </div>
            {/* end */}
            <div className="w-full flex items-center justify-between mb-4">
                <Type variant="metric-label" className="font-bold">Fin:</Type>
                <p>{event?.end}</p>
            </div>

            {/* description */}
            <Type variant="body" className="mb-4">
                {event?.description}
            </Type>
            {/* eliminate/modify buttons */}
            <div className="w-full flex justify-around items-center">
                <Button>
                    Eliminar
                </Button>
                <Button>
                    Modificar
                </Button>
            </div>
        </div>
    )
}

export default EventDetail;