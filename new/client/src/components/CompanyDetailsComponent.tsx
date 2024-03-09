import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import companiesAPI from "../services/companies";
import { DDMValuation } from "../models/Valuation";
import ValuationResultComponent from "./ValuationResult";
import { DDMValuationInputForm } from "./DDMValuationInput";
import { Editor } from "./Editor";
import { Col, Container, Row, Stack } from "react-bootstrap";

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
        <Container fluid>
          <div className="h2">{company.name}</div>
          {company.valuations.map((v: DDMValuation, i: number) => (
            <>
              <Row key={"date" + i}>
                <Col xs={7}></Col>
                <Col>
                  <div className="h4 text-start">
                    {new Date(v.date).toDateString()}
                  </div>
                </Col>
                <Col xs={3}></Col>
              </Row>
              <Row key={"company" + i} className="mb-5">
                <Col xs={7}>
                  <Editor id={"editor" + i} />
                </Col>
                <Col></Col>
                <Col xs={4}>
                  <Stack gap={4}>
                    <div
                      className="text-muted fst-italic text-decoration-underline"
                      style={{ marginBottom: "-16px" }}
                    >
                      Valuation based on {v.referenceReport} numbers
                    </div>
                    <DDMValuationInputForm readonly />
                    <ValuationResultComponent result={v.output} />
                  </Stack>
                </Col>
              </Row>
            </>
          ))}
        </Container>
      )}
    </>
  );
};

export default CompanyDetailsComponent;
