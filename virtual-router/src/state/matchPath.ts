import { PathMatch } from "../types.ts";

export const matchPath = (route: string, path: string): PathMatch => {
    const routeSegments = route.split('/').filter(s => s !== "");
    let pathSegments = path.split('/').filter(s => s !== "");
    if (routeSegments.length > pathSegments.length)
        return { isMatch: false, remainer: "", data: {}, query: "", hash: "", path: "" };
    if (routeSegments.length < pathSegments.length && routeSegments.at(-1) !== "*")
        return { isMatch: false, remainer: "", data: {}, query: "", hash: "", path: "" };
    let data: any = {};
    let query: string = "";
    let hash: string = "";
    for (let i = 0; i < routeSegments.length; ++i) {
        const routeSegment = routeSegments[i];
        const pathSegment = pathSegments[i];
        const sections = [...pathSegment.matchAll(/([?#]?)((?:(?![?#]).)*)/g)];
        const pathSection = sections?.find(s => s[1] === "")?.[2] ?? "";
        query = sections?.find(s => s[1] === "?")?.[2] ?? "";
        hash = sections?.find(s => s[1] === "#")?.[2] ?? "";

        if (routeSegment.startsWith(':') && pathSection && pathSection !== "") {
            data[routeSegment.substring(1)] = pathSection;
            continue;
        }
        if (routeSegment === "*") {
            return { isMatch: true, data, remainer: pathSegments.splice(i, -1).join('/'), query, hash, path: pathSegments.join('/') };
        }
        if (routeSegment !== pathSection)
            return { isMatch: false, data: {}, remainer: "", query: "", hash: "", path: "" };
    }

    return { isMatch: true, remainer: "", data, query, hash, path: path?.split("?")?.[0] ?? "" };
}
