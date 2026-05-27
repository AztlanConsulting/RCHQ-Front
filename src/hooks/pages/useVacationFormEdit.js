import { useCallback, useState } from "react";
import {
    calendarItemToDetail,
    normalizeDateOnly,
} from "../../utils/calendarEventDetail";
import {
    getRemainingVacations,
    updateVacationRequestDates,
} from "../../services/vacationService";
import { shiftDateOnlyRange } from "../../utils/dateRangeShift";
import { getVacationEditDatesErrors } from "../../utils/schema/vacation/vacation.schema";

const getVacationRequestId = (event) =>
    event?.vacationRequestId ??
    event?.vacationId ??
    "";

export const useVacationFormEdit = ({
    selectedEvent,
    selectedEventRef,
    reloadCurrentRange,
    setSelectedEvent,
    setAlert,
}) => {
    const [isVacationEditing, setIsVacationEditing] = useState(false);
    const [vacationRemainingInfo, setVacationRemainingInfo] = useState(null);
    const [isLoadingVacationRemaining, setIsLoadingVacationRemaining] =
        useState(false);
    const [vacationForm, setVacationForm] = useState({
        vacationRequestId: "",
        startDate: "",
        endDate: "",
    });
    const [vacationEditError, setVacationEditError] = useState("");
    const [isSavingVacation, setIsSavingVacation] = useState(false);

    const resetVacationEdit = useCallback(() => {
        setIsVacationEditing(false);
        setVacationEditError("");
        setVacationRemainingInfo(null);
        setIsLoadingVacationRemaining(false);
    }, []);

    const startVacationEdit = useCallback(() => {
        const currentSelectedEvent = selectedEventRef.current ?? selectedEvent;

        if (
            !currentSelectedEvent ||
            currentSelectedEvent.focus !== "vacaciones"
        ) {
            return;
        }

        const status = Number(currentSelectedEvent.status);

        if (status === 2) {
            setAlert({
                type: "error",
                message: "No se pueden modificar vacaciones rechazadas",
            });
            return;
        }

        setVacationForm({
            vacationRequestId: String(getVacationRequestId(currentSelectedEvent)),
            startDate: normalizeDateOnly(
                currentSelectedEvent.startDate ??
                    currentSelectedEvent.readableStart ??
                    currentSelectedEvent.start,
            ),
            endDate: normalizeDateOnly(
                currentSelectedEvent.endDate ??
                    currentSelectedEvent.readableEnd ??
                    currentSelectedEvent.end,
            ),
        });

        setVacationEditError("");
        setIsVacationEditing(true);
        setVacationRemainingInfo(null);

        const employeeId = currentSelectedEvent.employeeId;

        if (employeeId) {
            setIsLoadingVacationRemaining(true);

            getRemainingVacations(employeeId)
                .then(setVacationRemainingInfo)
                .catch(() => setVacationRemainingInfo(null))
                .finally(() => setIsLoadingVacationRemaining(false));
        }
    }, [selectedEvent, selectedEventRef, setAlert]);

    const cancelVacationEdit = useCallback(() => {
        resetVacationEdit();
    }, [resetVacationEdit]);

    const setVacationField = useCallback((field, value) => {
        const nextValue = String(value ?? "").slice(0, 80);

        setVacationForm((prev) =>
            field === "startDate"
                ? shiftDateOnlyRange(prev, nextValue)
                : {
                    ...prev,
                    [field]: nextValue,
                },
        );

        setVacationEditError("");
    }, []);

    const submitVacationEdit = useCallback(async () => {
        const currentSelectedEvent = selectedEventRef.current ?? selectedEvent;
        const vacationRequestId = getVacationRequestId(currentSelectedEvent);

        if (
            !currentSelectedEvent ||
            currentSelectedEvent.focus !== "vacaciones"
        ) {
            return;
        }

        const validation = getVacationEditDatesErrors({
            ...vacationForm,
            vacationRequestId,
        });

        if (!validation.success) {
            setVacationEditError(
                validation.errors.vacationRequestId ||
                    validation.errors.startDate ||
                    validation.errors.endDate ||
                    "Revisa las fechas antes de continuar.",
            );
            return;
        }

        const original = {
            startDate: normalizeDateOnly(
                currentSelectedEvent.startDate ??
                    currentSelectedEvent.readableStart ??
                    currentSelectedEvent.start,
            ),
            endDate: normalizeDateOnly(
                currentSelectedEvent.endDate ??
                    currentSelectedEvent.readableEnd ??
                    currentSelectedEvent.end,
            ),
        };

        if (
            vacationForm.startDate === original.startDate &&
            vacationForm.endDate === original.endDate
        ) {
            resetVacationEdit();
            return;
        }

        setIsSavingVacation(true);
        setVacationEditError("");

        try {
            const updatedVacation = await updateVacationRequestDates({
                vacationRequestId: validation.data.vacationRequestId,
                startDate: validation.data.startDate,
                endDate: validation.data.endDate,
            });

            const refreshedEvents = await reloadCurrentRange?.();

            const refreshedVacation = refreshedEvents?.find((event) => {
                const candidateId =
                    event.vacationRequestId ?? event.vacationId;

                return (
                    event.focus === "vacaciones" &&
                    String(candidateId) === String(vacationRequestId)
                );
            });

            const nextSelectedEvent = refreshedVacation
                ? calendarItemToDetail(refreshedVacation)
                : {
                    ...currentSelectedEvent,
                    vacationRequestId,
                    vacationId: vacationRequestId,
                    startDate:
                        updatedVacation?.startDate ??
                        updatedVacation?.start ??
                        vacationForm.startDate,
                    endDate:
                        updatedVacation?.endDate ??
                        updatedVacation?.end ??
                        vacationForm.endDate,
                    usedDays:
                        updatedVacation?.usedDays ??
                        updatedVacation?.used_days ??
                        currentSelectedEvent.usedDays,
                };

            selectedEventRef.current = nextSelectedEvent;
            setSelectedEvent(nextSelectedEvent);

            setAlert({
                type: "success",
                message: "Vacaciones modificadas correctamente",
            });

            resetVacationEdit();
        } catch (error) {
            setVacationEditError(
                error?.message || "No se pudieron modificar las vacaciones.",
            );
        } finally {
            setIsSavingVacation(false);
        }
    }, [
        selectedEvent,
        selectedEventRef,
        vacationForm,
        reloadCurrentRange,
        setSelectedEvent,
        setAlert,
        resetVacationEdit,
    ]);

    return {
        isVacationEditing,
        vacationForm,
        vacationEditError,
        isSavingVacation,
        vacationRemainingInfo,
        isLoadingVacationRemaining,
        startVacationEdit,
        cancelVacationEdit,
        setVacationField,
        submitVacationEdit,
        resetVacationEdit,
    };
};
