import { Button } from "@material-tailwind/react";
import { useState, useEffect } from "react";
import { DDMValuation, currencyFormatter } from "../models/Valuation";
import companiesAPI from "../services/companies";

const CompaniesComponent = () => {
  let [companies, setCompanies] = useState<
    { name: string; id: number; valuations: DDMValuation[] }[]
  >([]);
  useEffect(() => {
    companiesAPI.get().then((companies) => {
      setCompanies(companies);
    });
  }, []);

  return (
    <div className="p-4 overflow-x-auto">
      <table className="table-auto select-none w-full">
        <thead className="border-b">
          <tr>
            <th>Name</th>
            <th>Latest Valuation Date</th>
            <th>Latest Valuation Price</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {companies.map(({ id, name, valuations }) => (
            <tr key={id}>
              <td className="">{name}</td>
              <td>
                <div className="">
                  {valuations.length > 0 &&
                    new Date(valuations[0].date).toDateString()}
                </div>
              </td>
              <td>
                <div className="">
                  {valuations.length > 0 &&
                    currencyFormatter(valuations[0].output.pvStock)}
                </div>
              </td>
              <td>
                <div className="flex flex-row justify-center gap-2">
                  <Button>New Valuation</Button>
                  <Button>More...</Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CompaniesComponent;
