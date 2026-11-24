export const combineRoutes = (base: string, child: string): string => {
    if (!child) return base || "";
    if (child.startsWith('/')) return child;
    if (!base) return child;

    const baseSegments = base.split('/').filter(s => s !== "");
    const childSegments = child.split('/').filter(s => s !== "");
    if (baseSegments.length > 0 && baseSegments.at(-1) === "*") baseSegments.pop();
    if (baseSegments.length === 0)
        return `/${childSegments.join('/')}`;
    return `/${baseSegments.join('/')}/${childSegments.join('/')}`;
}
