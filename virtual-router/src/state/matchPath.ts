import { PathMatch } from "../types.ts";

export const matchPath = (route: string, path: string): PathMatch => {
    const routeSegments = route.split('/').filter(s => s !== "");
    let pathSegments = path.split('/').filter(s => s !== "");
    if (routeSegments.length === 0 && pathSegments.length === 0)
        return getMatch(path, true);
    if (routeSegments.length === 0 && pathSegments.length > 0)
        return getMatch(path, false);
    if (routeSegments.length === 1 && routeSegments[0] === "*")
        return getMatch(path, true);
    if (routeSegments.at(-1) !== "*" && routeSegments.length > pathSegments.length)
        return getMatch("", false);
    if (routeSegments.length < pathSegments.length && routeSegments.at(-1) !== "*")
        return getMatch("", false);
    let data: any = {};
    for (let i = 0; i < routeSegments.length; ++i) {
        const routeSegment = routeSegments[i];
        const pathSegment = pathSegments[i];
        const [pathSection, query, hash] = splitSegment(pathSegment);

        if (routeSegment.startsWith(':') && pathSection && pathSection !== "") {
            data[routeSegment.substring(1)] = pathSection;
            continue;
        }
        if (routeSegment === "*") {
            return { isMatch: true, data, remainder: pathSegments.splice(i, -1).join('/'), query, hash, path: pathSegments.join('/') };
        }
        if (routeSegment !== pathSection)
            return { isMatch: false, data: {}, remainder: "", query: "", hash: "", path: "" };
    }

    return getMatch(path, true, data);
}

const getMatch = (path:string, isMatch: boolean, data = {}) => {
    const [pathSection, query, hash] = splitSegment(path);
    return { isMatch, remainder:"", data, path: pathSection, query, hash };
}

const splitSegment = (segment: string): [string, string, string] => {
    if (segment === "" || segment === null)
        return ["", "", ""];
    const sections = [...segment.matchAll(/([?#]?)((?:(?![?#]).)*)/g)];
    const pathSection = sections?.find(s => s[1] === "")?.[2] ?? "";
    const query = sections?.find(s => s[1] === "?")?.[2] ?? "";
    const hash = sections?.find(s => s[1] === "#")?.[2] ?? "";
    return [pathSection, query, hash];
};