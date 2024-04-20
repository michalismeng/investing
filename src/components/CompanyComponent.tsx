import {
  CalendarDaysIcon,
  CalendarIcon,
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
  NewspaperIcon,
} from "@heroicons/react/24/outline";
import { CompanyWithValuations } from "../lib/prismaModels";
import { currencyFormatter } from "../models/Valuation";

export const CompanyInTableComponent = ({company: company}: { company: CompanyWithValuations }) => {
  return (
    <tr key={company.id}>
      <td>{company.name}</td>
      <td>
        <div className="flex flex-row justify-start items-center select-none">
          {(company.ddmValuations.length > 0 && (
            <>
              <div className="w-36 flex flex-row gap-2 justify-start items-center tooltip" data-tip="Date of the valuation">
                <CalendarIcon className="h-6 w-6" />
                {new Date(company.ddmValuations[0].date).toDateString()}
              </div>
              <div className="divider divider-horizontal"></div>
              <div className="w-28 flex flex-row gap-2 justify-start items-center tooltip" data-tip="Report that the numbers of the valuation are based on">
                <ClipboardDocumentListIcon className="h-6 w-6" />
                {company.ddmValuations[0].referenceReport}
              </div>
              <div className="divider divider-horizontal"></div>
              <div className="flex flex-row gap-2 justify-start items-center tooltip" data-tip="Value of the stock">
                <CurrencyDollarIcon className="h-6 w-6" />
                {currencyFormatter(company.ddmValuations[0].pvStock)}
              </div>
            </>
          )) || <div>No valuations for this company yet.</div>}
        </div>
      </td>
      <td>
        <div className="flex flex-row justify-start gap-4">
          <a
            className="btn btn-outline btn-sm"
            href={`/companies/${company.id}/valuation`}
          >
            <CurrencyDollarIcon className="h-6 w-6" />
            Valuate
          </a>
          <a
            className="btn btn-outline btn-sm"
            href={`/companies/${company.id}/stock-events`}
          >
            <NewspaperIcon className="h-5 w-5" />
            Events
          </a>
          <a
            className="btn btn-outline btn-sm"
            href={`/companies/${company.id}/timeline`}
          >
            <CalendarDaysIcon className="h-5 w-5" /> Timeline
          </a>
        </div>
      </td>
    </tr>
  );
};

