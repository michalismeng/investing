import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import companiesAPI from "../services/companies";
import { DDMValuation } from "../models/Valuation";
import ValuationResultComponent from "./ValuationResult";
import { DDMValuationInputForm } from "./DDMValuationInput";
import { Editor } from "./Editor";

const CompanyDetailsComponent = () => {
  let { id } = useParams();
  let [company, setCompany] = useState<any>(null);

  useEffect(() => {
    companiesAPI
      .get()
      .then((companies) => companies.filter((c) => c.id === +(id ?? 0) || 0))
      .then((c) => setCompany(c.length > 0 ? c[0] : null));
  }, [id]);

  return (
    <>
      {company && (
        <>
          <div className="text-3xl border-b mb-10">{company.name}</div>
          <div className="w-full">
            <Editor />
            {company.valuations.map((v: DDMValuation) => (
              <div className="flex flex-col mb-10">
                <div>{new Date(v.date).toDateString()}</div>
                <div className="flex flex-row justify-between">
                  <div className="border rounded p-4 max-w-96 h-fit">
                    Profi acquisition On October 30, 2023, Ahold Delhaize
                    announced it has agreed to acquire 100% of Romanian grocery
                    retailer Profi Rom Food SRL (Profi) from MidEuropa. Will be
                    completed in the second half of 2024. Will double the size
                    of Romania. Will cost around EUR 1.3 billion. Debt funded.
                  </div>
                  <div className="flex flex-col">
                    <div className="text-sm italic mb-2">
                      Valuation based on {v.referenceReport} numbers
                    </div>
                    <DDMValuationInputForm performValuation={() => {}} />
                    <ValuationResultComponent result={v.output} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
};

export default CompanyDetailsComponent;
