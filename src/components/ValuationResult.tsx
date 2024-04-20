import { FC } from "react";
import { DDMValuationOutput, currencyFormatter } from "../models/Valuation";

interface InputProps {
  result: DDMValuationOutput;
}

const ValuationResultComponent: FC<InputProps> = ({ result }) => {
  return (
    <div className="card shadow-lg overflow-x-auto">
      <table className="table table-sm">
        <thead>
          <tr>
            <th className="text-center" colSpan={2}>
              Valuation Result
            </th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <th className="text-start">Value of High Growth</th>
            <td className="text-end">{currencyFormatter(result.pvHighGrowth)}</td>
          </tr>
          <tr>
            <th className="text-start">Value of Stable Phase</th>
            <td className="text-end">{currencyFormatter(result.pvStable)}</td>
          </tr>
          <tr>
            <th className="text-start">Value of Stock</th>
            <th className="text-end">{currencyFormatter(result.pvStock)}</th>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ValuationResultComponent;
