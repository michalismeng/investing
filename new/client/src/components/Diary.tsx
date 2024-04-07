import { Card, Col, Container, Form, Row } from "react-bootstrap";
import { Editor } from "./Editor";
import { useEffect, useState } from "react";
import { DDMValuation } from "../models/Valuation";
import companiesAPI from "../services/companies";
import { useForm } from "react-hook-form";
import moment from "moment";
import { OutputData } from "@editorjs/editorjs";
import diaryAPI from "../services/diary";

const DiaryComponent = () => {
  let [companies, setCompanies] = useState<
    { name: string; id: number; valuations: DDMValuation[] }[]
  >([]);
  useEffect(() => {
    companiesAPI.get().then((companies) => {
      setCompanies(companies);
    });
  }, []);

  const {
    handleSubmit,
    register,
    getValues,
  } = useForm<FormData & { company: string; timelineDate: Date }>({
    defaultValues: {
      timelineDate: moment().toDate(),
    },
  });

  const onSubmit = async (blocks: OutputData) => {
    let metadata = getValues();
    await diaryAPI.post({
      companyId: +metadata.company,
      date: metadata.timelineDate,
      entry: blocks,
      type: "Diary",
    });
  };

  return (
    <Container>
      <Row>
        <div className="h2 mb-5 text-center">Write your diary entry</div>
      </Row>

      <Form onSubmit={handleSubmit((e) => console.log(e))} className="mb-5">
        <Row>
          <Col>
            <Form.Select
              aria-label="Default select example"
              {...register("company")}
            >
              <option value={undefined}>Select your company...</option>
              {companies &&
                companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </Form.Select>
          </Col>
          <Col>
            <Form.Control
              type="date"
              {...register("timelineDate")}
            ></Form.Control>
          </Col>
        </Row>
      </Form>

      <Row>
        <Card className="shadow">
          <Card.Body>
            <Editor onSubmit={onSubmit} />
          </Card.Body>
        </Card>
      </Row>
    </Container>
  );
};

export default DiaryComponent;
