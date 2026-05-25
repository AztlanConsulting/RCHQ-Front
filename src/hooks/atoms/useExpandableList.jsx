import { useMemo, useState } from "react";

export const useExpandableList = (items = [], limit = 0, resetKey = "") => {
    const safeItems = useMemo(
        () => (Array.isArray(items) ? items : []),
        [items],
    );
    const expansionKey = `${resetKey}:${limit}`;
    const [expandedKey, setExpandedKey] = useState(null);

    const isExpanded = expandedKey === expansionKey;

    const canExpand = limit > 0 && safeItems.length > limit;

    const visibleItems = useMemo(() => {
        if (!canExpand || isExpanded) return safeItems;
        return safeItems.slice(0, limit);
    }, [canExpand, isExpanded, limit, safeItems]);

    return {
        visibleItems,
        hiddenCount: canExpand ? safeItems.length - limit : 0,
        isExpanded,
        canExpand,
        toggleExpanded: () =>
            setExpandedKey((currentKey) =>
                currentKey === expansionKey ? null : expansionKey,
            ),
    };
};
