import { Card, Col, Container, Form, Row } from "react-bootstrap";
import { Editor } from "./Editor";
import { useEffect, useState } from "react";
import companiesAPI from "../services/companies";
import { useForm } from "react-hook-form";
import moment from "moment";
import { OutputData } from "@editorjs/editorjs";
import eventsAPI from "../services/events";
import { Company } from "@prisma/client";

const StockEventComponent = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  useEffect(() => {
    companiesAPI.get().then(setCompanies);
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
    const metadata = getValues();
    const companyId = companies.find(c => c.id == +metadata.company)!.id
    await eventsAPI.post({
      companyId: companyId,
      date: new Date(metadata.timelineDate),
      entry: blocks as object,
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

export default StockEventComponent;
