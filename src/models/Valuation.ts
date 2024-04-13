import { DDMValuationInput } from "../components/DDMValuationInput";

export const percentageFormatter = (v: number) =>
  v.toLocaleString(undefined, { style: "percent", minimumFractionDigits: 2 });

export const currencyFormatter = (v: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(v);

export interface ValuationBoard {
  index: [string, fn?: (v: number) => string][];
  columns: string[];
  rows: { [id: string]: number[] };
}

export interface DDMValuationOutput {
  pvHighGrowth: number,
  pvStable: number,
  pvStock: number,
}

export interface DDMValuation {
  input: DDMValuationInput,
  board: ValuationBoard,
  output: DDMValuationOutput,
  referenceReport: string,    // Quarter / Fiscal year that the financial inputs are drawn from
  date: Date,                 // Date that the valuation happens, usually today. This defined the state of the economy (e.g., country risk premium)
  company: string,
}