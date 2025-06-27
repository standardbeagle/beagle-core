export interface XPathSegment {
    property: string;
    index?: number;
    isArray?: boolean;
}
export declare function parseXPath(xpath: string): XPathSegment[];
export declare function combineXPaths(base: string, relative: string): string;
export declare function getDataAtXPath(data: Record<string, any>, xpath: string): any;
export declare function setDataAtXPath(data: Record<string, any>, xpath: string, value: any, operation?: 'merge' | 'replace' | 'append' | 'delete'): Record<string, any>;
export declare function extractXPathParams(pattern: string, actual: string): Record<string, string | number>;
