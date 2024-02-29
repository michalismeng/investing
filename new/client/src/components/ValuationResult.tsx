import { FC } from "react";
import { DDMValuationOutput, currencyFormatter } from "../models/Valuation";

interface InputProps {
  result: DDMValuationOutput;
}

const ValuationResultComponent: FC<InputProps> = ({ result }) => {
  return (
    <>
      <div className="border border-white rounded-xl h-fit overflow-x-auto">
        <table className="border-spacing-4 border-separate">
          <tbody>
            <tr>
              <th className="text-start">Valuation Result</th>
            </tr>
            <tr>
              <th className="text-start">PV of High Growth</th>
              <td>{currencyFormatter(result.pvHighGrowth)}</td>
            </tr>
            <tr>
              <th className="text-start">PV of stable phase</th>
              <td>{currencyFormatter(result.pvStable)}</td>
            </tr>
            <tr>
              <th className="text-start">Value of stock</th>
              <td>{currencyFormatter(result.pvStock)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
};

export default ValuationResultComponent;
