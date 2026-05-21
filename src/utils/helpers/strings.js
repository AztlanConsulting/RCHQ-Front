const SEARCH_DISALLOWED_CHARS_REGEX = /[^\p{L}\p{M}\p{N}\s]/gu;

class Strings {
  static sanitize(value = "") {
    return String(value)
      .normalize("NFC")
      .replace(SEARCH_DISALLOWED_CHARS_REGEX, "");
  }

  static getSafeText(value, fallback = "-") {
    if (value === null || value === undefined) return fallback;
    const text = String(value).trim();
    return text || fallback;
  }
}

export default Strings;
