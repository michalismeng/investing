import { useEffect, useState } from "react";
import companiesAPI from "../services/companies";
import { DDMValuationInputForm } from "./DDMValuationInput";
import { Editor } from "./Editor";
import { TimelineEntry } from "../models/TimelineEntry";
import { currencyFormatter } from "../models/Valuation";
import { OutputData } from "@editorjs/editorjs";
import { CompanyWithValuationsAndEvents } from "../lib/prismaModels";
import { format } from "date-fns";
import { CurrencyDollarIcon, NewspaperIcon } from "@heroicons/react/24/outline";

const TimelineComponent = ({ id }: { id: number }) => {
  const [company, setCompany] = useState<CompanyWithValuationsAndEvents | null>(
    null
  );
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);

  useEffect(() => {
    async function doit() {
      const company = await companiesAPI.getByIdWithValuationsAndEvents(+id);
      setCompany(company);

      const valuationEntries: TimelineEntry[] = company.ddmValuations.map(
        (v) => {
          return { ...v, type: "Valuation" };
        }
      );
      const diaryEntries = company.events.map((d) => {
        return {
          ...d,
          entry: d.entry as object as OutputData,
          type: "Diary",
        } as TimelineEntry;
      });
      const timeline = valuationEntries.concat(diaryEntries);
      timeline.sort(
        (b, a) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      setTimeline(timeline);
    }
    doit();
  }, [id]);

  return (
    <div className="w-full">
      {company && (
        <h1 className="text-3xl font-bold text-center mb-8">
          {company.name + " Timeline"}
        </h1>
      )}
      <div className="w-3/4">
        <ul className="timeline timeline-vertical">
          {company &&
            timeline.map((t, i) => (
              <li
                key={"timelineitem-" + i}
                style={{
                  gridTemplateColumns:
                    "var(--timeline-col-start, minmax(0, 0.25fr)) auto var(--timeline-col-end,minmax(0, 1fr)",
                }}
              >
                {i > 0 && <hr className="min-h-4" />}
                <div className="timeline-start">
                  {format(new Date(t.date), "MMMM dd, yyyy")}
                </div>
                <div className="timeline-middle px-2">
                  {t.type == "Valuation" ? (
                    <CurrencyDollarIcon className="w-8 h-8" />
                  ) : (
                    <NewspaperIcon className="w-8 h-8" />
                  )}
                </div>
                <div className="timeline-end py-4 w-full">
                  {(t.type === "Diary" && (
                    <div key={"diary-" + i} className="w-full">
                      <Editor
                        placeholder={false}
                        editorId={"editor-" + i}
                        readonly={true}
                        initialContent={t.entry}
                      />
                    </div>
                  )) ||
                    (t.type === "Valuation" && (
                      <div className="card shadow-lg outline outline-1 outline-gray-200 p-4 flex flex-col gap-2">
                        <div>
                          Stock valued at {currencyFormatter(t.pvStock)}
                        </div>
                        <div className="italic text-decoration-underline mb-2">
                          Valuation based on {t.referenceReport} numbers
                        </div>
                        <DDMValuationInputForm />
                      </div>
                    ))}
                </div>
                {i < timeline.length - 1 && <hr className="min-h-4" />}
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
};

export default TimelineComponent;
