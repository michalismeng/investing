import { useState, useEffect } from "react";
import { DDMValuation, currencyFormatter } from "../models/Valuation";
import companiesAPI from "../services/companies";
import { Link } from "react-router-dom";
import { Button, Container, Stack, Table } from "react-bootstrap";

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
        <div className="h1 mb-5">Stock Research Platform</div>

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
                  <Stack direction="horizontal">
                    <Button
                      variant="outline-dark"
                      as="a"
                      href={`/companies/${id}`}
                      className="mx-auto"
                    >
                      More...
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
