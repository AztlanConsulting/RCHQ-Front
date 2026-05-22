import { useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";

const DATE_PARAM_PATTERN = /^(\d{4}-\d{2}-\d{2})/;
const UUID_PARAM_PATTERN =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const parseDateParam = (value) => {
    const matchedDate = String(value ?? "").match(DATE_PARAM_PATTERN);
    if (!matchedDate) return null;

    const [year, month, day] = matchedDate[1].split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));

    if (
        date.getUTCFullYear() !== year ||
        date.getUTCMonth() !== month - 1 ||
        date.getUTCDate() !== day
    ) {
        return null;
    }

    return date;
};

const getVacationStartDate = (vacation, fallbackDate) => {
    return parseDateParam(
        vacation?.startDate ??
            vacation?.start ??
            fallbackDate,
    );
};

export const useCalendarSearchParams = ({
    calendarRef,
    rawCalendarEvents = [],
    openCalendarItemDetail,
}) => {
    const [searchParams] = useSearchParams();
    const openedVacationLinkRef = useRef("");

    const dateParam = searchParams.get("date") ?? "";
    const typeParam = searchParams.get("type") ?? "";
    const idParam = searchParams.get("id") ?? "";

    const pendingVacationLink = useMemo(() => {
        const date = parseDateParam(dateParam);

        if (
            typeParam !== "vacacion" ||
            !date ||
            !UUID_PARAM_PATTERN.test(idParam)
        ) {
            return null;
        }

        const linkKey = `${typeParam}:${idParam}:${dateParam}`;

        return {
            key: linkKey,
            id: idParam,
            date,
            dateParam,
        };
    }, [dateParam, idParam, typeParam]);

    useEffect(() => {
        if (!pendingVacationLink) return undefined;

        let animationFrameId = null;
        let attempts = 0;
        let cancelled = false;

        const moveToDate = () => {
            if (cancelled) return;

            const calendarApi = calendarRef.current?.getApi?.();

            if (calendarApi) {
                calendarApi.gotoDate(pendingVacationLink.date);
                return;
            }

            attempts += 1;

            if (attempts <= 20) {
                animationFrameId = window.requestAnimationFrame(moveToDate);
            }
        };

        moveToDate();

        return () => {
            cancelled = true;

            if (animationFrameId) {
                window.cancelAnimationFrame(animationFrameId);
            }
        };
    }, [calendarRef, pendingVacationLink]);

    useEffect(() => {
        if (
            !pendingVacationLink ||
            openedVacationLinkRef.current === pendingVacationLink.key
        ) {
            return undefined;
        }

        const matchingVacation = rawCalendarEvents.find(
            (event) =>
                event.focus === "vacaciones" &&
                String(event.vacationId) === pendingVacationLink.id,
        );

        if (!matchingVacation) return undefined;

        const vacationStartDate = getVacationStartDate(
            matchingVacation,
            pendingVacationLink.dateParam,
        );
        const calendarApi = calendarRef.current?.getApi?.();

        if (vacationStartDate && calendarApi) {
            calendarApi.gotoDate(vacationStartDate);
        }

        openedVacationLinkRef.current = pendingVacationLink.key;
        openCalendarItemDetail(matchingVacation);

        return undefined;
    }, [
        calendarRef,
        openCalendarItemDetail,
        pendingVacationLink,
        rawCalendarEvents,
    ]);
};
