import type { ItemTableProps } from "prez-components";

const RDF_TYPE = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
const HIDDEN_TYPES = new Set([
    "https://olis.dev/RealGraph",
    "https://olis.dev/VirtualGraph",
    "http://example.org/TopLevelCatalog",
]);
const HIDDEN_PROPERTIES = new Set([RDF_TYPE, "https://olis.dev/includes"]);

export function visibleTypes<T extends ItemTableProps["term"]>(types?: T[]): T[] {
    return types?.filter(type => !HIDDEN_TYPES.has(type.value)) ?? [];
}

// Hide internal graph membership and types already displayed above the table.
// Leave nested property tables and the underlying API data intact.
export function withoutTypeRow<T extends ItemTableProps["term"]>(term: T): T {
    if (!("properties" in term) || !term.properties) return term;
    return {
        ...term,
        properties: Object.fromEntries(
            Object.entries(term.properties).filter(([predicate]) => !HIDDEN_PROPERTIES.has(predicate))
        ),
    };
}
