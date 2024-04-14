import { FC } from "react";
import { ValuationBoard } from "../models/Valuation";

interface InputProps {
  valuation: ValuationBoard;
}

const ValuationBoardComponent: FC<InputProps> = ({ valuation }) => {
  return (
    <div className="card shadow-lg overflow-x-auto">
      <table className="table select-none">
        <thead>
          <tr>
            <th>Year</th>
            {valuation.columns.map((c) => (
              <th className="text-center text-nowrap">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {valuation.index.map(([index, formatter]) => (
            <tr className="hover:bg-gray-200">
              <th className="">
                <div className="text-start text-nowrap">{index}</div>
              </th>
              {valuation.rows[index] &&
                valuation.rows[index].map((d) => (
                  <td>
                    <div className="text-center text-nowrap">
                      {formatter?.(d) || d}
                    </div>
                  </td>
                ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ValuationBoardComponent;
