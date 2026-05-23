import { useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import {
    getEventsInRange,
    getOwnEmployeeId,
    getCalendarViewerRole,
} from "../../services/calendarService";

const DATE_PARAM_PATTERN = /^(\d{4}-\d{2}-\d{2})/;
const UUID_PARAM_PATTERN =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const canUseHouseCalendar = (role) =>
    role === "Administrador" || role === "Coordinador";

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

const toDateParam = (date) => {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

const addDaysToDateParam = (date, days) => {
    const nextDate = new Date(date);
    nextDate.setUTCDate(nextDate.getUTCDate() + days);

    return toDateParam(nextDate);
};

export const useCalendarSearchParams = ({
    calendarRef,
    openCalendarItemDetail,
    reloadVisibleRange,
    setCalendarMode,
}) => {
    const [searchParams] = useSearchParams();
    const openedVacationLinkRef = useRef("");

    const dateParam = searchParams.get("date") ?? "";
    const typeParam = searchParams.get("type") ?? "";
    const idParam = searchParams.get("id") ?? "";
    const employeeIdParam = searchParams.get("employeeId") ?? "";

    const ownEmployeeId = getOwnEmployeeId();
    const viewerRole = getCalendarViewerRole();

    const pendingVacationLink = useMemo(() => {
        const date = parseDateParam(dateParam);

        if (
            typeParam !== "vacacion" ||
            !date ||
            !UUID_PARAM_PATTERN.test(idParam)
        ) {
            return null;
        }

        const linkKey = `${typeParam}:${idParam}:${dateParam}:${employeeIdParam}`;

        return {
            key: linkKey,
            id: idParam,
            date,
            dateParam,
            employeeId: employeeIdParam,
        };
    }, [dateParam, employeeIdParam, idParam, typeParam]);

    useEffect(() => {
        if (
            !pendingVacationLink ||
            openedVacationLinkRef.current === pendingVacationLink.key
        ) {
            return undefined;
        }

        const calendarApi = calendarRef.current?.getApi?.();
        calendarApi?.gotoDate(pendingVacationLink.date);

        let cancelled = false;

        const openVacationFromLink = async () => {
            const employeeId = pendingVacationLink.employeeId || getOwnEmployeeId();

            if (!employeeId) return;

            if (
                String(employeeId) !== String(ownEmployeeId) &&
                canUseHouseCalendar(viewerRole)
            ) {
                setCalendarMode?.("house");
            }

            const endDate = addDaysToDateParam(pendingVacationLink.date, 1);
            const events = await getEventsInRange(
                employeeId,
                pendingVacationLink.dateParam,
                endDate,
            );

            if (cancelled) return;

            const matchingVacation = events.find(
                (event) =>
                    event.focus === "vacaciones" &&
                    String(event.vacationId) === pendingVacationLink.id,
            );

            if (!matchingVacation) return;

            const vacationStartDate = getVacationStartDate(
                matchingVacation,
                pendingVacationLink.dateParam,
            );

            if (vacationStartDate) {
                calendarRef.current?.getApi?.()?.gotoDate(vacationStartDate);
            }

            openedVacationLinkRef.current = pendingVacationLink.key;
            openCalendarItemDetail(matchingVacation);
            await reloadVisibleRange?.(calendarRef);
        };

        openVacationFromLink().catch((err) => {
            console.error(err);
        });

        return () => {
            cancelled = true;
        };
    }, [
        calendarRef,
        openCalendarItemDetail,
        ownEmployeeId,
        pendingVacationLink,
        reloadVisibleRange,
        setCalendarMode,
        viewerRole,
    ]);
};
