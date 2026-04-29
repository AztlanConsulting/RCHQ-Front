import { useEffect, useState } from "react";
import { getEmployees } from "../../Services/PersonalService";

export const useEmployees = () => {
    const [employees, setEmployees] = useState([]);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 6,
        total: 0,
        totalPages: 0,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState("true");
    const [page, setPage] = useState(1);
    const limit = 6;

    const fetchEmployees = async (
        pageNum = 1,
        searchStr = "",
        activeStr = "true",
    ) => {
        setLoading(true);
        setError(null);

        try {
            const result = await getEmployees(
                pageNum,
                limit,
                searchStr,
                activeStr,
            );
            setEmployees(result.data);
            setPagination(result.pagination);
        } catch (err) {
            setError(err.message);
            console.error("Error fetching employees:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees(1, searchQuery, activeFilter);
        setPage(1);
    }, [searchQuery, activeFilter]);

    const handleNextPage = () => {
        if (page < pagination.totalPages) {
            const newPage = page + 1;
            setPage(newPage);
            fetchEmployees(newPage, searchQuery, activeFilter);
        }
    };

    const handlePrevPage = () => {
        if (page > 1) {
            const newPage = page - 1;
            setPage(newPage);
            fetchEmployees(newPage, searchQuery, activeFilter);
        }
    };

    return {
        employees,
        pagination,
        loading,
        error,
        searchQuery,
        setSearchQuery,
        activeFilter,
        setActiveFilter,
        page,
        handleNextPage,
        handlePrevPage,
    };
};
