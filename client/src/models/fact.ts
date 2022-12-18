export interface FactRow extends Record<string, any> {
    tag: string;
    line: number;
    uom: string;
    plabel: string;
    report: number;
}

export let factRowStaticKeys: string[] = [
    "tag", "line", "uom", "plabel", "report"
]