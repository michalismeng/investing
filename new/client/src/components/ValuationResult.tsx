import { FC } from "react";
import { DDMValuationOutput, currencyFormatter } from "../models/Valuation";
import { Table } from "react-bootstrap";

interface InputProps {
  result: DDMValuationOutput;
}

const ValuationResultComponent: FC<InputProps> = ({ result }) => {
  return (
    <div className="border border-black rounded p-1">
      <Table size="sm" borderless className="mb-0">
        <thead>
          <tr>
            <th className="text-center" colSpan={2}>
              Valuation Result
            </th>
          </tr>
        </thead>

        <tbody>
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
      </Table>
    </div>
  );
};

export default ValuationResultComponent;
