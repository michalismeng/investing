import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import companiesAPI from "../services/companies";
import { DDMValuationInputForm } from "./DDMValuationInput";
import { Editor } from "./Editor";
import { Alert, Col, Container, Row, Stack } from "react-bootstrap";
import { TimelineEntry } from "../models/TimelineEntry";
import diaryAPI from "../services/diary";
import moment from "moment";
import { Timeline } from "rsuite";
import "rsuite/Timeline/styles/index.css";
import { currencyFormatter } from "../models/Valuation";
import { CurrencyDollar } from "react-bootstrap-icons";

const TimelineComponent = () => {
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
        (b, a) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      setTimeline(timeline);
    }
    doit();
  }, [id]);

  return (
    <Container>
      <Timeline isItemActive={() => false}>
        {company &&
          timeline.map((t, i) => (
            <Timeline.Item
              key={"timelineitem-" + i}
              className="pb-4"
              dot={
                t.type == "Valuation" ? (
                  <CurrencyDollar
                    size={32}
                    className="border rounded-circle p-1"
                    style={{
                      marginLeft: "-12px",
                      backgroundColor: "whitesmoke",
                      marginTop: "-4px",
                    }}
                  />
                ) : undefined
              }
            >
              <h3>{moment(t.date).format("MMMM DD, YYYY")}</h3>
              <Row>
                <Col lg={12} xl={8}>
                  <div className="border rounded p-3">
                    {(t.type === "Diary" && (
                      <div key={"diary-" + i}>
                        <Editor
                          placeholder={false}
                          editorId={"editor-" + i}
                          readonly={true}
                          initialContent={t.entry}
                        />
                      </div>
                    )) ||
                      (t.type === "Valuation" && (
                        <Stack key={"valuation-" + i} gap={4}>
                          <div
                            className="text-muted fst-italic text-decoration-underline"
                            style={{ marginBottom: "-16px" }}
                          >
                            Valuation based on {t.referenceReport} numbers
                          </div>
                          <DDMValuationInputForm readonly />
                          <Alert
                            variant="primary"
                            className="fw-bold w-50 mx-auto text-center"
                          >
                            Stock valued at{" "}
                            {currencyFormatter(t.output.pvStock)}
                          </Alert>
                        </Stack>
                      ))}
                  </div>
                </Col>
              </Row>
            </Timeline.Item>
          ))}
      </Timeline>
    </Container>
  );
};

export default TimelineComponent;
