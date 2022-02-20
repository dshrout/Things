export function IsNullOrWhiteSpace (item: string): Boolean {
    return !(typeof item !='undefined' && item && (item.trim()));
}
