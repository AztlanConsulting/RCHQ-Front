import { useCallback, useEffect, useMemo, useState } from "react";
import {
    getPendingVacationRequests,
    getReviewedVacationRequests,
    approveVacationRequest,
    rejectVacationRequest,
} from "../../services/vacationRequestService";
import { useDebouncedVacationSearch } from "../molecules/useDebouncedVacationSearch";

const LIMIT = 6;

const DEFAULT_PAGINATION = {
    page: 1,
    limit: LIMIT,
    total: 0,
    totalPages: 0,
};

const isInvalidDateRange = (startDate, endDate) => {
    if (!startDate || !endDate) return false;
    return startDate > endDate;
};

export const useVacationRequests = ({ initialView = "pending" } = {}) => {
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

    const [selectedRequest, setSelectedRequest] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [approvingRequestId, setApprovingRequestId] = useState(null);
    const [rejectingRequestId, setRejectingRequestId] = useState(null);

    const clearError = () => {
        setError("");
    };

    const filters = useMemo(
        () => ({
            search: searchQuery,
            startDate,
            endDate,
            status: statusFilter,
        }),
        [searchQuery, startDate, endDate, statusFilter],
    );

    const fetchRequests = useCallback(
        async (pageToFetch = 1) => {
            if (isInvalidDateRange(filters.startDate, filters.endDate)) {
                setRequests([]);
                setPagination(DEFAULT_PAGINATION);
                setPage(1);
                setError("La fecha de inicio no puede ser posterior a la fecha de término");
                return;
            }

            setLoading(true);
            setError("");

            try {
                const fetcher =
                    view === "pending"
                        ? getPendingVacationRequests
                        : getReviewedVacationRequests;

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
                setError(err.message || "No se pudieron cargar las solicitudes");
            } finally {
                setLoading(false);
            }
        },
        [view, filters],
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
        setSelectedRequest(null);
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
        setSelectedRequest(null);
        setPage(1);
    };

    const handleApproveRequest = async (vacationRequestId) => {
        if (!vacationRequestId || approvingRequestId) return;

        setApprovingRequestId(vacationRequestId);
        setError("");

        try {
            await approveVacationRequest(vacationRequestId);

            const nextPage =
                requests.length === 1 && page > 1
                    ? page - 1
                    : page;

            await fetchRequests(nextPage);
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

            const nextPage =
                requests.length === 1 && page > 1
                    ? page - 1
                    : page;

            await fetchRequests(nextPage);
        } catch (err) {
            setError(err.message || "No se pudo rechazar la solicitud");
            throw err;
        } finally {
            setRejectingRequestId(null);
        }
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
        selectedRequest,
        setSelectedRequest,
        loading,
        error,
        clearError,
        approvingRequestId,
        rejectingRequestId,
        handleApproveRequest,
        handleRejectRequest,
        handleNextPage,
        handlePrevPage,
        clearFilters,
        refetch: () => fetchRequests(page),
    };
};
