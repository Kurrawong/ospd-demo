import type { ItemTableProps } from "prez-components";

const RDF_TYPE = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
const REAL_GRAPH = "https://olis.dev/RealGraph";

export function visibleTypes<T extends ItemTableProps["term"]>(types?: T[]): T[] {
    return types?.filter(type => type.value !== REAL_GRAPH) ?? [];
}

// The focus resource's types are already displayed above its property table.
// Leave nested property tables and the underlying API data intact.
export function withoutTypeRow<T extends ItemTableProps["term"]>(term: T): T {
    if (!("properties" in term) || !term.properties) return term;
    return {
        ...term,
        properties: Object.fromEntries(
            Object.entries(term.properties).filter(([predicate]) => predicate !== RDF_TYPE)
        ),
    };
}
