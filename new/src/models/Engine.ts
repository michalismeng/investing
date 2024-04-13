import {
  ValuationBoard,
  currencyFormatter,
  percentageFormatter,
} from "./Valuation";

export const zip = <T>(...arr: T[][]): T[][] =>
  Array.from({ length: Math.max(...arr.map((a) => a.length)) }, (_, i) =>
    arr.map((a) => a[i])
  );

export const dcf = (
  cashflows: number[],
  discountRate: number[],
  isCumulative = true
) =>
  zip(cashflows, isCumulative ? discountRate : accumulate(discountRate)).map(
    ([x, y]) => x / y
  );

export const stablePhase = (
  growth: number,
  baseCashflow: number,
  discountRate: number
) => (baseCashflow * (1 + growth)) / (discountRate - growth);

export const accumulate = (numbers: number[], base = 1) =>
  numbers
    .reduce((prev: number[], cur) => [...prev, cur * prev.slice(-1)[0]], [base])
    .slice(1);

export const grow = (base: number, growth: number[]) =>
  accumulate(
    growth.map((g) => 1 + g),
    base
  );

export const stable = (base: number, steps: number) =>
  new Array<number>(steps).fill(base);

export const lerp = (start: number, end: number, steps: number) =>
  [...new Array(steps).keys()]
    .map((s) => s + 1)
    .map((s) => start - ((start - end) / steps) * s);

export const ddmGenerator = (
  eps: number,
  epsGrowth: number,
  payout: number,
  costOfEquity: number,
  years = 5
): ValuationBoard => {
  const epsGrowth_array = stable(epsGrowth, years);
  const eps_array = grow(eps, epsGrowth_array);
  const payout_array = stable(payout, years);
  const dps_array = zip(eps_array, payout_array).map(([e, p]) => e * p);
  const costOfEquity_array = stable(costOfEquity, years);

  return ddmGeneratorBase(
    epsGrowth_array,
    eps_array,
    payout_array,
    dps_array,
    costOfEquity_array
  );
};

export const generator = (
  [index, formatter]: [string, (v: number) => string],
  data: (() => number)[] | number[]
): ValuationBoard => {
  return {
    columns: lerp(0, data.length, data.length).map((c) => c.toString()),
    index: [[index, formatter]],
    rows: {
      [index]: data.map((d) => (d instanceof Function ? d() : d)),
    },
  };
};

export const ddmGeneratorBase = (
  expectedGrowthRate: number[],
  earningsPerShare: number[],
  payoutRatio: number[],
  dividedsPerShare: number[] | null = null,
  costOfEquity: number[] | null = null,
  startValuation: ValuationBoard | null = null
): ValuationBoard => {
  const years = expectedGrowthRate.length;
  const baseCostOfEquity =
    startValuation?.rows["Cumulative Cost of Equity"].slice(-1)[0] || 1;
  const cumulativeCostOfEquity = accumulate(
    costOfEquity?.map((c) => 1 + c) || [],
    baseCostOfEquity
  );
  const dps =
    dividedsPerShare ||
    zip(earningsPerShare!, payoutRatio!).map(([e, p]) => e * p);
  return {
    columns: lerp(0, years, years).map((c) => c.toString()),
    index: [
      ["Expected Growth Rate", percentageFormatter],
      ["Earnings per share", currencyFormatter],
      ["Payout ratio", percentageFormatter],
      ["Dividends per share", currencyFormatter],
      ["Cost of Equity", percentageFormatter],
      ["Cumulative Cost of Equity", percentageFormatter],
      ["Present Value", currencyFormatter],
    ],
    rows: {
      "Expected Growth Rate": expectedGrowthRate,
      "Earnings per share": earningsPerShare || [],
      "Payout ratio": payoutRatio || [],
      "Dividends per share": dps,
      "Cost of Equity": costOfEquity || [],
      "Cumulative Cost of Equity": cumulativeCostOfEquity,
      "Present Value": dcf(dps || [], cumulativeCostOfEquity),
    },
  };
};

export const mergeBoards = (b1: ValuationBoard, b2: ValuationBoard) => {
  const val = {
    index: b1.index,
    columns: b1.columns.concat(b2.columns),
    rows: b1.rows,
  };

  for (const v of Object.keys(val.rows)) {
    val.rows[v] = val.rows[v].concat(b2.rows[v]);
  }

  return val;
};
