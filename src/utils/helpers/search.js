const SEARCH_DISALLOWED_CHARS_REGEX = /[^\p{L}\p{M}\p{N}\s]/gu;

class Search {
  static sanitize(value = "") {
    return String(value)
      .normalize("NFC")
      .replace(SEARCH_DISALLOWED_CHARS_REGEX, "");
  }
}

export default Search;
