export const capitalizeName = (value) => {
    if (value == null || value === "") return "";

    const trailingSpaces = value.match(/\s*$/)?.[0] ?? "";
    const core = value.trimEnd();

    if (!core) {
        return trailingSpaces;
    }

    const normalized = core
        .split(/\s+/)
        .filter(Boolean)
        .map(
            (word) =>
                word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
        )
        .join(" ");

    return normalized + trailingSpaces;
};
