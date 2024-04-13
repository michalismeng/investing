import { FC } from "react";
import { ValuationBoard } from "../models/Valuation";

interface InputProps {
  valuation: ValuationBoard;
}

const ValuationBoardComponent: FC<InputProps> = ({ valuation }) => {
  return (
    <div className="border border-white rounded-xl p-4 overflow-x-auto">
      <table className="table-auto select-none w-full">
        <thead className="border-b">
          <tr>
            <th></th>
            {valuation.columns.map((c) => (
              <th>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {valuation.index.map(([index, formatter]) => (
            <tr className="hover:bg-blue-gray-400">
              <th className="">
                <div className="text-start p-2 mr-5">{index}</div>
              </th>
              {valuation.rows[index] &&
                valuation.rows[index].map((d) => (
                  <td>
                    <div className="text-center mx-2">
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
