import { FC, useState } from "react";
import { DDMValuationInputForm, DDMValuationInput } from "./DDMValuationInput";
import {
  dcf,
  ddmGenerator,
  ddmGeneratorBase,
  grow,
  lerp,
  mergeBoards,
  stablePhase,
} from "../models/Engine";
import {
  DDMValuation,
  DDMValuationOutput,
  ValuationBoard,
} from "../models/Valuation";
import ValuationBoardComponent from "./ValuationBoard";
import ValuationResultComponent from "./ValuationResult";

interface InputProps {}

const DDMValuationComponent: FC<InputProps> = ({}) => {
  const [valuation, setValuation] = useState<ValuationBoard | null>(null);
  const [valuationOutput, setValuationOutput] =
    useState<DDMValuationOutput | null>(null);
  const performValuation = (d: DDMValuationInput) => {
    let val: ValuationBoard | null = null;

    const years = 10;
    if (d.gradualAdj == false) {
      val = ddmGenerator(d.eps, d.epsGrowth, d.payout, d.returnRate, years);
    } else {
      let val_start = ddmGenerator(
        d.eps,
        d.epsGrowth,
        d.payout,
        d.returnRate,
        Math.floor(years / 2)
      );
      const epsBase = val_start.rows["Earnings per share"].slice(-1)[0];
      const growth = lerp(d.epsGrowth, d.stableGrowth, Math.ceil(years / 2));
      const payout = lerp(d.payout, d.stablePayout, Math.ceil(years / 2));
      const requiredRet = lerp(
        d.returnRate,
        d.stableReturnRate,
        Math.ceil(years / 2)
      );
      const eps = grow(epsBase, growth);
      let val_end = ddmGeneratorBase(
        growth,
        eps,
        payout,
        null,
        requiredRet,
        val_start
      );
      val = mergeBoards(val_start, val_end);
    }

    setValuation(val);
    const pvHigh = val.rows["Present Value"].reduce((prev, cur) => prev + cur);
    const sp = stablePhase(
      d.stableGrowth,
      val.rows["Dividends per share"].slice(-1)[0],
      d.stableReturnRate
    );
    const pvStable = dcf(
      [sp],
      [val.rows["Cumulative Cost of Equity"].slice(-1)[0]],
      true
    )[0];

    const valuation: DDMValuation = {
      input: d,
      board: val,
      output: {
        pvHighGrowth: pvHigh,
        pvStable: pvStable,
        pvStock: pvHigh + pvStable,
      },
      company: "Ahold Delhaize",
      date: new Date(),
      referenceReport: "FY2023",
    };

    setValuationOutput(valuation.output);

    console.log(valuation);
  };
  return (
    <>
      <div className="flex flex-row gap-4 justify-between">
        <DDMValuationInputForm performValuation={performValuation} />
        {valuationOutput && (
          <ValuationResultComponent result={valuationOutput} />
        )}
      </div>

      <div className="mt-10">
        {valuation && <ValuationBoardComponent valuation={valuation} />}
      </div>
    </>
  );
};

export default DDMValuationComponent;
