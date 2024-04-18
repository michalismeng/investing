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
import { DDMValuationOutput, ValuationBoard } from "../models/Valuation";
import ValuationBoardComponent from "./ValuationBoard";
import ValuationResultComponent from "./ValuationResult";
import valuationsAPI from "../services/valuations";

interface InputProps {
  companyId?: number;
  referenceReport?: string;
}

const DDMValuationComponent: FC<InputProps> = ({ companyId, referenceReport }: InputProps) => {
  const [valuation, setValuation] = useState<ValuationBoard | null>(null);
  const [valuationOutput, setValuationOutput] =
    useState<DDMValuationOutput | null>(null);
  const [valuationInput, setValuationInput] = useState<DDMValuationInput>();

  const performValuation = async () => {
    const d = valuationInput;
    if (!d) {
      return;
    }
    let val: ValuationBoard | null = null;

    const years = 10;
    if (d.gradualAdj == false) {
      val = ddmGenerator(d.eps, d.epsGrowth, d.payout, d.returnRate, years);
    } else {
      const val_start = ddmGenerator(
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
      const val_end = ddmGeneratorBase(
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

    setValuationOutput({
      pvHighGrowth: pvHigh,
      pvStable: pvStable,
      pvStock: pvHigh + pvStable,
    });

    await valuationsAPI.postDDM({
      companyId: companyId!,
      date: new Date(),
      referenceReport: referenceReport || "unspecified",
      ...d,
      pvStock: pvHigh + pvStable,
    });
  };
  return (
    <>
      <div className="container mx-auto flex flex-col gap-4">
        <h1 className="text-3xl font-bold text-center mb-4">
          Dividend Discount Valuation Model
        </h1>

        <div className="flex flex-row gap-8 mb-4">
          <DDMValuationInputForm setValuationInput={setValuationInput} />
          <div className="flex flex-col flex-grow gap-2">
            <button
              type="submit"
              className="btn btn-outline"
              onClick={async () => await performValuation()}
            >
              Valuate!
            </button>
            {valuationOutput && (
              <ValuationResultComponent result={valuationOutput} />
            )}
          </div>
        </div>

        {valuation && (
          <>
            <ValuationBoardComponent valuation={valuation} />
          </>
        )}
      </div>
    </>
  );
};

export default DDMValuationComponent;
