import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    getPendingVacationRequests,
    getReviewedVacationRequests,
    getFutureVacationRequests,
    getPastVacationRequests,
    approveVacationRequest,
    rejectVacationRequest,
} from "../../services/vacationRequestService";
import { useDebouncedVacationSearch } from "../molecules/useDebouncedVacationSearch";
import { getVacationRequestFiltersError } from "../../utils/schema/vacation/vacation.schema";
import { normalizeDateOnly } from "../../utils/calendarEventDetail";

const LIMIT = 6;

const DEFAULT_PAGINATION = {
    page: 1,
    limit: LIMIT,
    total: 0,
    totalPages: 0,
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
    const [statusFilter, setStatusFilter] = useState("all");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const navigate = useNavigate();

    const clearError = () => {
        setError("");
    };

    const filters = useMemo(
        () => ({
            ...(includeSearch ? { search: searchQuery } : {}),
            startDate,
            endDate,
            status: statusFilter,
        }),
        [includeSearch, searchQuery, startDate, endDate, statusFilter],
    );

    const fetchRequests = useCallback(
        async (pageToFetch = 1) => {
            const validationError = getVacationRequestFiltersError(filters);

            if (validationError) {
                setRequests([]);
                setPagination(DEFAULT_PAGINATION);
                setPage(1);
                setError(validationError);
                return;
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
            } catch (err) {
                setRequests([]);
                setPagination(DEFAULT_PAGINATION);
                setError(err.message || errorMessage);
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
        setStatusFilter("all");
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
    const [approvingRequestId, setApprovingRequestId] = useState(null);
    const [rejectingRequestId, setRejectingRequestId] = useState(null);

    const vacationRequests = useVacationRequestsBase({
        initialView,
        getFetcher: getVacationRequestsFetcher,
        includeSearch: true,
        errorMessage: "No se pudieron cargar las solicitudes",
        onReset: () => setSelectedRequest(null),
    });

    const {
        requests,
        page,
        refetch,
        setError,
    } = vacationRequests;

    const clearError = vacationRequests.clearError;

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

    const handleRejectRequest = async (vacationRequestId) => {
        if (!vacationRequestId || approvingRequestId || rejectingRequestId) return;

        setRejectingRequestId(vacationRequestId);
        setError("");

        try {
            await rejectVacationRequest(vacationRequestId);
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

    return {
        ...vacationRequests,
        selectedRequest,
        setSelectedRequest,
        clearError,
        approvingRequestId,
        rejectingRequestId,
        handleApproveRequest,
        handleRejectRequest,
    };
};

export const useVacationList = ({ initialView = "future" } = {}) => {
    return useVacationRequestsBase({
        initialView,
        getFetcher: getVacationListFetcher,
        errorMessage: "No se pudieron cargar las vacaciones",
    });
};
