function unique(data, accessor) {
    return Array.from(new Set(accessor ? data.map(accessor) : data));
}

/**
 * Implementation of uniqueValid that came from @uwdata in observableHQ
 */
export function uniqueValid(data, accessor) {
    return unique(data, accessor)
        .filter(d => d != null && d === d)
        .sort((a, b) => a < b ? -1 : a > b ? 1 : 0);
}