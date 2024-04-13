import { FC } from "react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { z } from "zod";
import Form from "react-bootstrap/Form";
import { Button, InputGroup, Stack } from "react-bootstrap";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

const DDMValuationInputsValidator = z.object({
  eps: z.coerce.number(),
  epsGrowth: z.coerce.number(),
  payout: z.coerce.number(),
  gradualAdj: z.coerce.boolean(),
  returnRate: z.coerce.number(),
  stableReturnRate: z.coerce.number(),
  stablePayout: z.coerce.number(),
  stableGrowth: z.coerce.number(),
});

export type DDMValuationInput = z.infer<typeof DDMValuationInputsValidator>;
interface ValuationInputProps extends React.HTMLAttributes<HTMLFormElement> {
  performValuation?: (f: DDMValuationInput) => void;
  readonly?: boolean;
}

export const DDMValuationInputForm: FC<ValuationInputProps> = ({
  performValuation,
  readonly = false,
}) => {
  const {
    handleSubmit,
    register,
  } = useForm<DDMValuationInput>({
    resolver: zodResolver(DDMValuationInputsValidator),
    defaultValues: {
      eps: 2.29,
      epsGrowth: 0.0859,
      payout: 0.4716,
      gradualAdj: true,
      returnRate: 0.051,
      stableReturnRate: 0.09,
      stableGrowth: 0.005,
      stablePayout: 0.6667,
    },
  });

  return (
    <Container fluid>
      <Form onSubmit={handleSubmit((e) => performValuation?.(e))}>
        <Stack direction="vertical" gap={4}>
          <Row>
            <Col>
              <InputGroup>
                <InputGroup.Text>EPS</InputGroup.Text>
                <Form.Control
                  placeholder="Enter the company's EPS ..."
                  aria-label="EPS"
                  {...register("eps")}
                />
              </InputGroup>
            </Col>
            <Col>
              <Form.Check
                type="checkbox"
                label="Gradually adjust values to stable phase"
                {...register("gradualAdj")}
                className="text-start mt-1"
              />
            </Col>
          </Row>

          <Row>
            <Col>
              <InputGroup>
                <InputGroup.Text>EPS Growth</InputGroup.Text>
                <Form.Control
                  placeholder="Enter the company's EPS growth rate ..."
                  aria-label="EPS Growth"
                  {...register("epsGrowth")}
                />
              </InputGroup>
            </Col>
            <Col>
              <InputGroup>
                <InputGroup.Text>Stable Growth</InputGroup.Text>
                <Form.Control
                  placeholder="Enter the company's growth rate in the stable phase ..."
                  aria-label="Stable Growth"
                  {...register("stableGrowth")}
                />
              </InputGroup>
            </Col>
          </Row>

          <Row>
            <Col>
              <InputGroup>
                <InputGroup.Text>Payout</InputGroup.Text>
                <Form.Control
                  placeholder="Enter the company's payout ratio ..."
                  aria-label="Payout Ratio"
                  {...register("payout")}
                />
              </InputGroup>
            </Col>
            <Col>
              <InputGroup>
                <InputGroup.Text>Stable Payout</InputGroup.Text>
                <Form.Control
                  placeholder="Enter the company's payout ratio in the stable phase ..."
                  aria-label="Stable Payout"
                  {...register("stablePayout")}
                />
              </InputGroup>
            </Col>
          </Row>

          <Row>
            <Col>
              <InputGroup>
                <InputGroup.Text>Return Rate</InputGroup.Text>
                <Form.Control
                  placeholder="Enter the desired return rate ..."
                  aria-label="Return Rate"
                  {...register("returnRate")}
                />
              </InputGroup>
            </Col>
            <Col>
              <InputGroup>
                <InputGroup.Text>Stable Return Rate</InputGroup.Text>
                <Form.Control
                  placeholder="Enter the desired return rate in the stable phase ..."
                  aria-label="Stable Return Rate"
                  {...register("stableReturnRate")}
                />
              </InputGroup>
            </Col>
          </Row>

          {!readonly && (
            <Row>
              <Col></Col>
              <Col>
                <Button type="submit" variant="outline-dark" className="w-100">
                  Valuate!
                </Button>
              </Col>
            </Row>
          )}
        </Stack>
      </Form>
    </Container>
  );
};
