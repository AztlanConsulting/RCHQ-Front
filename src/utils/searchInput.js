const SEARCH_DISALLOWED_CHARS_REGEX = /[^\p{L}\p{M}\p{N}\s]/gu;

export const sanitizeSearchInput = (value = "") => {
    return String(value).replace(SEARCH_DISALLOWED_CHARS_REGEX, "");
};
