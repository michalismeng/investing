import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import companiesAPI from "../services/companies";
import ValuationResultComponent from "./ValuationResult";
import { DDMValuationInputForm } from "./DDMValuationInput";
import { Editor } from "./Editor";
import { Container, Stack } from "react-bootstrap";
import { TimelineEntry } from "../models/TimelineEntry";
import diaryAPI from "../services/diary";
import moment from "moment";

const CompanyDetailsComponent = () => {
  let { id } = useParams();
  let [company, setCompany] = useState<any>(null);
  let [timeline, setTimeline] = useState<TimelineEntry[]>([]);

  useEffect(() => {
    async function doit() {
      let companies = await companiesAPI.get();
      let company = companies.filter((c) => c.id === +(id ?? 0) || 0)[0];
      setCompany(company);

      let valuationEntries: TimelineEntry[] = company.valuations.map((v) => {
        return { ...v, type: "Valuation" };
      });
      let diaryEntries: TimelineEntry[] = await diaryAPI.getById(company.id);
      let timeline = valuationEntries.concat(diaryEntries);
      timeline.sort(
        (b, a) =>
          (
            (a.type === "Diary" && new Date(a.timelineDate)) ||
            (a.type === "Valuation" && new Date(a.date)) ||
            new Date()
          ).getTime() -
          (
            (b.type === "Diary" && new Date(b.timelineDate)) ||
            (b.type === "Valuation" && new Date(b.date)) ||
            new Date()
          ).getTime()
      );
      setTimeline(timeline);
    }
    doit();
  }, [id]);

  return (
    <Container>
      {company && (
        <Stack gap={4}>
          {timeline &&
            timeline.map(
              (t, i) =>
                (t.type === "Diary" && (
                  <div key={"diary-" + i}>
                    <h3>
                      As of {moment(t.timelineDate).format("MMMM Do YYYY")}
                    </h3>
                    <div className="border rounded">
                      <Editor
                        editorId={"editor-" + i}
                        readonly={true}
                        initialContent={t.entry}
                      />
                    </div>
                  </div>
                )) ||
                (t.type === "Valuation" && (
                  <Stack key={"valuation-" + i} gap={4}>
                    <h3>As of {moment(t.date).format("MMMM Do YYYY")}</h3>
                    <div
                      className="text-muted fst-italic text-decoration-underline"
                      style={{ marginBottom: "-16px" }}
                    >
                      Valuation based on {t.referenceReport} numbers
                    </div>
                    <DDMValuationInputForm readonly />
                    <ValuationResultComponent result={t.output} />
                  </Stack>
                ))
            )}
        </Stack>
      )}
    </Container>
  );
};

export default CompanyDetailsComponent;
