import { useState, useEffect } from "react";
import { currencyFormatter } from "../models/Valuation";
import companiesAPI from "../services/companies";
import { CompanyWithValuations } from "../lib/prismaModels";
import { useSession } from "next-auth/react";
import {
  CurrencyDollarIcon,
  NewspaperIcon,
  CalendarDaysIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";
import { CalendarIcon } from "@heroicons/react/20/solid";

const CompaniesComponent = () => {
  const session = useSession();
  const [companies, setCompanies] = useState<CompanyWithValuations[]>([]);
  useEffect(() => {
    if (session.status == "authenticated") {
      companiesAPI.getWithValuations(session.data.userId).then((companies) => {
        setCompanies(companies);
      });
    }
  }, []);

  return (
    <>
      <div className="container mx-auto">
        <table className="table table-pin-rows">
          <thead>
            <tr>
              <th>Name</th>
              <th>Latest Valuation</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>
                  <div className="flex flex-row justify-start items-center select-none">
                    {(c.ddmValuations.length > 0 && (
                      <>
                        <div className="w-36 flex flex-row gap-2 justify-start items-center">
                          <CalendarIcon className="h-6 w-6" />
                          {new Date(c.ddmValuations[0].date).toDateString()}
                        </div>
                        <div className="divider divider-horizontal"></div>
                        <div className="w-28 flex flex-row gap-2 justify-start items-center">
                          <ClipboardDocumentListIcon className="h-6 w-6" />
                          {c.ddmValuations[0].referenceReport}
                        </div>
                        <div className="divider divider-horizontal"></div>
                        <div className="flex flex-row gap-2 justify-start items-center">
                          <CurrencyDollarIcon className="h-6 w-6" />
                          {currencyFormatter(c.ddmValuations[0].pvStock)}
                        </div>
                      </>
                    )) || <div>No valuations for this company yet.</div>}
                  </div>
                </td>
                <td>
                  <div className="flex flex-row justify-start gap-4">
                    <a className="btn btn-outline btn-sm" href={`/companies/${c.id}/valuation`}>
                      <CurrencyDollarIcon className="h-6 w-6" />
                      Valuate
                    </a>
                    <a
                      className="btn btn-outline btn-sm"
                      href={`/companies/${c.id}/stock-events`}
                    >
                      <NewspaperIcon className="h-5 w-5" />
                      Events
                    </a>
                    <a
                      className="btn btn-outline btn-sm"
                      href={`/companies/${c.id}/timeline`}
                    >
                      <CalendarDaysIcon className="h-5 w-5" /> Timeline
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default CompaniesComponent;
