import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    getPendingVacationRequests,
    getReviewedVacationRequests,
    getFutureVacationRequests,
    getPastVacationRequests,
    approveVacationRequest,
    rejectVacationRequest,
} from "../../services/vacationRequestService";
import { deleteVacationRequest } from "../../services/vacationService";
import { useDebouncedVacationSearch } from "../molecules/useDebouncedVacationSearch";
import { useVacationFormEdit } from "./useVacationFormEdit";
import { getVacationRequestFiltersError } from "../../utils/schema/vacation/vacation.schema";
import {
    dateOnlyToLocalDate,
    normalizeDateOnly,
} from "../../utils/calendarEventDetail";

const LIMIT = 6;

const DEFAULT_PAGINATION = {
    page: 1,
    limit: LIMIT,
    total: 0,
    totalPages: 0,
};

const PENDING_STATUS = 0;
const APPROVED_STATUS = 1;
const REJECTED_STATUS = 2;

const getAllowedStatusFilters = (view) =>
    view === "past"
        ? ["all", "approved", "rejected"]
        : view === "reviewed"
          ? ["all", "approved", "rejected"]
        : ["all", "pending", "approved", "rejected"];

const getDefaultStatusFilter = () => "all";

const getVacationRequestEmployee = (request) => request?.employee ?? {};

const getVacationRequestEmployeeName = (request) => {
    const employee = getVacationRequestEmployee(request);
    const fullName =
        request?.employeeName ??
        request?.fullName ??
        employee.fullName ??
        [employee.name, employee.surname].filter(Boolean).join(" ");

    return fullName || "";
};

const getVacationRequestEmployeeId = (request) => {
    const employee = getVacationRequestEmployee(request);

    return request?.employeeId ?? employee.employeeId ?? employee.id ?? "";
};

const mapVacationRequestToEvent = (request) => {
    if (!request) return null;

    const vacationRequestId = request.vacationRequestId ?? request.vacationId;
    const employee = getVacationRequestEmployee(request);
    const startDate = normalizeDateOnly(request.startDate ?? request.start);
    const endDate = normalizeDateOnly(request.endDate ?? request.end);
    const start = request.start ?? dateOnlyToLocalDate(startDate);
    const end = request.end ?? dateOnlyToLocalDate(endDate);

    return {
        ...request,
        id: vacationRequestId,
        vacationId: vacationRequestId,
        vacationRequestId,
        focus: "vacaciones",
        title: request.description || "Vacaciones",
        employeeId: getVacationRequestEmployeeId(request),
        employeeName: getVacationRequestEmployeeName(request),
        curp: request.curp ?? employee.curp ?? "",
        start,
        end,
        startDate,
        endDate,
        readableStart: startDate,
        readableEnd: endDate,
        vacationStatus: request.status,
        vacationFeedback: request.feedback,
        feedback: request.feedback ?? request.description ?? "",
        totalDays: request.totalDays ?? request.naturalDays ?? "",
    };
};

const useVacationRequestsBase = ({
    initialView,
    getFetcher,
    includeSearch = false,
    errorMessage,
    onReset = () => {},
} = {}) => {
    const [view, setView] = useState(initialView);
    const [requests, setRequests] = useState([]);
    const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
    const [page, setPage] = useState(1);
    const {
        inputValue: searchInput,
        setInputValue: setSearchInput,
        debouncedSearch: searchQuery,
        clearSearch,
    } = useDebouncedVacationSearch("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [statusFilter, setStatusFilter] = useState(
        getDefaultStatusFilter(initialView),
    );

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const navigate = useNavigate();

    const clearError = () => {
        setError("");
    };

    useEffect(() => {
        if (!getAllowedStatusFilters(view).includes(statusFilter)) {
            setStatusFilter(getDefaultStatusFilter(view));
        }
    }, [statusFilter, view]);

    const filters = useMemo(
        () => ({
            ...(includeSearch ? { search: searchQuery } : {}),
            startDate,
            endDate,
            status: getAllowedStatusFilters(view).includes(statusFilter)
                ? statusFilter
                : getDefaultStatusFilter(view),
        }),
        [includeSearch, searchQuery, startDate, endDate, statusFilter, view],
    );

    const fetchRequests = useCallback(
        async (pageToFetch = 1) => {
            const validationError = getVacationRequestFiltersError(filters);

            if (validationError) {
                setRequests([]);
                setPagination(DEFAULT_PAGINATION);
                setPage(1);
                setError(validationError);
                return [];
            }

            setLoading(true);
            setError("");

            try {
                const fetcher = getFetcher(view);

                const result = await fetcher({
                    page: pageToFetch,
                    limit: LIMIT,
                    ...filters,
                });

                setRequests(result.data);
                setPagination(result.pagination);
                setPage(result.pagination.page || pageToFetch);

                return result.data;
            } catch (err) {
                setRequests([]);
                setPagination(DEFAULT_PAGINATION);
                setError(err.message || errorMessage);

                return [];
            } finally {
                setLoading(false);
            }
        },
        [view, filters, getFetcher, errorMessage],
    );

    useEffect(() => {
        fetchRequests(1);
    }, [fetchRequests]);

    useEffect(() => {
        setPage(1);
    }, [searchQuery, startDate, endDate, statusFilter, view]);

    const handleChangeView = (nextView) => {
        setView(nextView);
        setPage(1);
        onReset();
    };

    const handleNextPage = () => {
        if (page < pagination.totalPages) {
            fetchRequests(page + 1);
        }
    };

    const handlePrevPage = () => {
        if (page > 1) {
            fetchRequests(page - 1);
        }
    };

    const clearFilters = () => {
        clearSearch();
        setStartDate("");
        setEndDate("");
        setStatusFilter(getDefaultStatusFilter(view));
        setPage(1);
        onReset();
    };

    const onViewDetail = (request) => {
        const vacationId = request.vacationRequestId;
        const date = normalizeDateOnly(request.startDate);
        const employeeId =
            request.employeeId ??
            request.employee?.employeeId ??
            request.employee?.id ??
            "";

        if (!vacationId || !date) return;

        const params = new URLSearchParams({
            type: "vacacion",
            date,
            id: vacationId,
        });

        if (employeeId) {
            params.set("employeeId", employeeId);
        }

        navigate(`/app/calendario?${params.toString()}`);
    };

    return {
        view,
        setView: handleChangeView,
        requests,
        pagination,
        page,
        searchInput,
        setSearchInput,
        searchQuery,
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        statusFilter,
        setStatusFilter,
        loading,
        error,
        setError,
        clearError,
        handleNextPage,
        handlePrevPage,
        clearFilters,
        refetch: (pageToFetch = page) => fetchRequests(pageToFetch),
        onViewDetail,
    };
};

const getVacationRequestsFetcher = (view) => {
    return view === "pending"
        ? getPendingVacationRequests
        : getReviewedVacationRequests;
};

const getVacationListFetcher = (view) => {
    return view === "future"
        ? getFutureVacationRequests
        : getPastVacationRequests;
};

export const useVacationRequests = ({ initialView = "pending" } = {}) => {
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [viewingRequest, setViewingRequest] = useState(null);
    const [approvingRequestId, setApprovingRequestId] = useState(null);
    const [rejectingRequestId, setRejectingRequestId] = useState(null);
    const [isMobileFiltersExpanded, setIsMobileFiltersExpanded] =
        useState(false);

    const closeViewingRequest = useCallback(() => {
        setViewingRequest(null);
    }, []);

    const vacationRequests = useVacationRequestsBase({
        initialView,
        getFetcher: getVacationRequestsFetcher,
        includeSearch: true,
        errorMessage: "No se pudieron cargar las solicitudes",
        onReset: () => {
            setSelectedRequest(null);
            closeViewingRequest();
        },
    });

    const {
        requests,
        page,
        refetch,
        setError,
        onViewDetail: navigateToRequestDetail,
    } = vacationRequests;

    const clearError = vacationRequests.clearError;

    const handleViewDetail = useCallback(
        (request) => {
            if (Number(request?.status) === REJECTED_STATUS) {
                const vacationEvent = mapVacationRequestToEvent(request);

                if (vacationEvent) {
                    setViewingRequest(vacationEvent);
                }

                return;
            }

            navigateToRequestDetail(request);
        },
        [navigateToRequestDetail],
    );

    const handleApproveRequest = async (vacationRequestId) => {
        if (!vacationRequestId || approvingRequestId) return;

        setApprovingRequestId(vacationRequestId);
        setError("");

        try {
            await approveVacationRequest(vacationRequestId);
            const currentPage = Math.max(page, 1);

            const nextPage =
                requests.length === 1 && currentPage > 1
                    ? currentPage - 1
                    : currentPage;

            await refetch(nextPage);
        } catch (err) {
            setError(err.message || "No se pudo aprobar la solicitud");
            throw err;
        } finally {
            setApprovingRequestId(null);
        }
    };

    const handleRejectRequest = async (vacationRequestId, feedback) => {
        if (!vacationRequestId || approvingRequestId || rejectingRequestId)
            return;

        setRejectingRequestId(vacationRequestId);
        setError("");

        try {
            await rejectVacationRequest(vacationRequestId, feedback);

            const currentPage = Math.max(page, 1);

            const nextPage =
                requests.length === 1 && currentPage > 1
                    ? currentPage - 1
                    : currentPage;

            await refetch(nextPage);
        } catch (err) {
            setError(err.message || "No se pudo rechazar la solicitud");
            throw err;
        } finally {
            setRejectingRequestId(null);
        }
    };

    const toggleMobileFilters = useCallback(() => {
        setIsMobileFiltersExpanded((current) => !current);
    }, []);

    return {
        ...vacationRequests,
        onViewDetail: handleViewDetail,
        selectedRequest,
        setSelectedRequest,
        viewingRequest,
        closeViewingRequest,
        clearError,
        approvingRequestId,
        rejectingRequestId,
        handleApproveRequest,
        handleRejectRequest,
        isMobileFiltersExpanded,
        toggleMobileFilters,
    };
};

export const useVacationList = ({ initialView = "future" } = {}) => {
    const selectedVacationRef = useRef(null);
    const [selectedVacation, setSelectedVacation] = useState(null);
    const [viewingVacation, setViewingVacation] = useState(null);
    const [vacationToDelete, setVacationToDelete] = useState(null);
    const [isDeletingVacation, setIsDeletingVacation] = useState(false);
    const [deleteVacationError, setDeleteVacationError] = useState("");
    const [alert, setAlert] = useState(null);

    const vacationList = useVacationRequestsBase({
        initialView,
        getFetcher: getVacationListFetcher,
        errorMessage: "No se pudieron cargar las vacaciones",
    });
    const {
        view,
        page,
        requests,
        refetch,
        setView: setBaseView,
        clearFilters: clearBaseFilters,
        onViewDetail: navigateToVacationDetail,
    } = vacationList;

    const setSelectedVacationEvent = useCallback((event) => {
        selectedVacationRef.current = event;
        setSelectedVacation(event);
    }, []);

    const reloadCurrentVacationPage = useCallback(async () => {
        const refreshedRequests = await refetch(page);

        return Array.isArray(refreshedRequests)
            ? refreshedRequests.map(mapVacationRequestToEvent).filter(Boolean)
            : [];
    }, [page, refetch]);

    const {
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
    } = useVacationFormEdit({
        selectedEvent: selectedVacation,
        selectedEventRef: selectedVacationRef,
        reloadCurrentRange: reloadCurrentVacationPage,
        setSelectedEvent: setSelectedVacationEvent,
        setAlert,
    });

    const clearAlert = useCallback(() => {
        setAlert(null);
    }, []);

    const resetVacationActions = useCallback(() => {
        resetVacationEdit();
        setViewingVacation(null);
        setVacationToDelete(null);
        setDeleteVacationError("");
        selectedVacationRef.current = null;
        setSelectedVacation(null);
    }, [resetVacationEdit]);

    const closeViewingVacation = useCallback(() => {
        setViewingVacation(null);
    }, []);

    const handleViewDetail = useCallback(
        (request) => {
            if (Number(request?.status) === REJECTED_STATUS) {
                const vacationEvent = mapVacationRequestToEvent(request);

                if (vacationEvent) {
                    setViewingVacation(vacationEvent);
                }

                return;
            }

            navigateToVacationDetail(request);
        },
        [navigateToVacationDetail],
    );

    const handleChangeView = useCallback(
        (nextView) => {
            resetVacationActions();
            setBaseView(nextView);
        },
        [resetVacationActions, setBaseView],
    );

    const clearFilters = useCallback(() => {
        resetVacationActions();
        clearBaseFilters();
    }, [clearBaseFilters, resetVacationActions]);

    const handleEditVacation = useCallback(
        (request) => {
            if (
                view !== "future" ||
                Number(request?.status) !== PENDING_STATUS
            ) {
                return;
            }

            const vacationEvent = mapVacationRequestToEvent(request);

            if (!vacationEvent?.vacationRequestId) return;

            setSelectedVacationEvent(vacationEvent);
            startVacationEdit();
        },
        [setSelectedVacationEvent, startVacationEdit, view],
    );

    const openDeleteVacation = useCallback(
        (request) => {
            if (
                view !== "future" &&
                Number(request?.status) === APPROVED_STATUS
            ) {
                return;
            }

            const vacationEvent = mapVacationRequestToEvent(request);

            if (!vacationEvent?.vacationRequestId) return;

            resetVacationEdit();
            setDeleteVacationError("");
            setVacationToDelete(vacationEvent);
        },
        [resetVacationEdit, view],
    );

    const cancelDeleteVacation = useCallback(() => {
        setVacationToDelete(null);
        setDeleteVacationError("");
    }, []);

    const confirmDeleteVacation = useCallback(async () => {
        const vacationRequestId = vacationToDelete?.vacationRequestId;

        if (!vacationRequestId || isDeletingVacation) return;

        setIsDeletingVacation(true);
        setDeleteVacationError("");

        try {
            await deleteVacationRequest(vacationRequestId);

            const currentPage = Math.max(page, 1);
            const nextPage =
                requests.length === 1 && currentPage > 1
                    ? currentPage - 1
                    : currentPage;

            setVacationToDelete(null);
            await refetch(nextPage);

            setAlert({
                type: "success",
                message: "Vacaciones eliminadas correctamente",
            });
        } catch (error) {
            setDeleteVacationError(
                error?.message || "No se pudieron eliminar las vacaciones.",
            );
        } finally {
            setIsDeletingVacation(false);
        }
    }, [isDeletingVacation, page, refetch, requests.length, vacationToDelete]);

    return {
        ...vacationList,
        setView: handleChangeView,
        clearFilters,
        onViewDetail: handleViewDetail,
        alert,
        clearAlert,
        selectedVacation,
        viewingVacation,
        closeViewingVacation,
        isVacationEditing,
        vacationForm,
        vacationEditError,
        isSavingVacation,
        vacationRemainingInfo,
        isLoadingVacationRemaining,
        handleEditVacation,
        cancelVacationEdit,
        submitVacationEdit,
        setVacationField,
        vacationToDelete,
        isDeletingVacation,
        deleteVacationError,
        openDeleteVacation,
        cancelDeleteVacation,
        confirmDeleteVacation,
    };
};
