import useSearch from "./useSearch";

const LOGS_SEARCH_DISALLOWED_REGEX = /[^a-zA-ZñÑáéíóúÁÉÍÓÚüÜ0-9\s]/g;
const LOGS_SEARCH_MAX_LENGTH = 100;

const sanitizeLogsSearch = (value) =>
  String(value)
    .replace(LOGS_SEARCH_DISALLOWED_REGEX, "")
    .replace(/\s+/g, " ")
    .slice(0, LOGS_SEARCH_MAX_LENGTH);

const normalizeLogsLength = (value) => value.trim().replace(/\s+/g, " ").length;
const normalizeLogsSearchValue = (value) => value.toLocaleLowerCase("es-MX");

const useLogsSearch = (initialValue = "", onSearch) =>
  useSearch(initialValue, onSearch, {
    sanitize: sanitizeLogsSearch,
    getSearchLength: normalizeLogsLength,
    transformSearchValue: normalizeLogsSearchValue,
  });

export default useLogsSearch;
