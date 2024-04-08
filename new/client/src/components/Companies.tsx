import { useState, useEffect } from "react";
import { DDMValuation, currencyFormatter } from "../models/Valuation";
import companiesAPI from "../services/companies";
import { Button, Container, Stack, Table } from "react-bootstrap";
import { Calendar3Week, CurrencyDollar, Newspaper } from "react-bootstrap-icons";
import { signIn } from "next-auth/react";

const CompaniesComponent = () => {
  let [companies, setCompanies] = useState<
    { name: string; id: number; valuations: DDMValuation[] }[]
  >([]);
  useEffect(() => {
    companiesAPI.get().then((companies) => {
      setCompanies(companies);
    });
  }, []);

  return (
    <>
      <Container>
        <div className="h1 mb-5 text-center">Stock Research Platform</div>

        <button onClick={() => signIn("github", { callbackUrl: '/login-success' })}>Click to sign in</button>

        <Table className="mx-auto" hover>
          <thead>
            <tr>
              <th>Name</th>
              <th>Latest Valuation Date</th>
              <th>Latest Valuation Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {companies.map(({ id, name, valuations }) => (
              <tr key={id}>
                <td>{name}</td>
                <td>
                  <div>
                    {valuations.length > 0 &&
                      new Date(valuations[0].date).toDateString()}
                  </div>
                </td>
                <td>
                  <div className="">
                    {valuations.length > 0 &&
                      currencyFormatter(valuations[0].output.pvStock)}
                  </div>
                </td>
                <td>
                  <Stack direction="horizontal" gap={2}>
                    <Button
                      variant="outline-dark"
                      as="a"
                      href={`/valuation`}
                      className="mx-auto"
                    >
                      <div className="d-flex align-items-center">
                        <CurrencyDollar className="me-1" /> Valuation
                      </div>
                    </Button>
                    <Button
                      variant="outline-dark"
                      as="a"
                      href={`/companies/${id}/diary`}
                      className="mx-auto"
                    >
                      <div className="d-flex align-items-center">
                        <Newspaper className="me-1" /> Event
                      </div>
                    </Button>
                    <Button
                      variant="outline-dark"
                      as="a"
                      href={`/companies/${id}/timeline`}
                      className="mx-auto"
                    >
                      <div className="d-flex align-items-center">
                        <Calendar3Week className="me-1" /> Timeline
                      </div>
                    </Button>
                  </Stack>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Container>
    </>
  );
};

export default CompaniesComponent;
