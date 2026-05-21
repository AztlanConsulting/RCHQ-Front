class Strings {
  static SEARCH_DISALLOWED_CHARS_REGEX = /[^\p{L}\p{M}\p{N}\s]/gu;

  static sanitize(value = "") {
    return String(value)
      .normalize("NFC")
      .replace(Strings.SEARCH_DISALLOWED_CHARS_REGEX, "");
  }

  static getSafeText(value, fallback = "-") {
    if (value === null || value === undefined) return fallback;
    const text = String(value).trim();
    return text || fallback;
  }
}

export default Strings;
