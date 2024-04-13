import { useState, useEffect } from "react";
import { currencyFormatter } from "../models/Valuation";
import companiesAPI from "../services/companies";
import { Button, Container, Stack, Table } from "react-bootstrap";
import { Calendar3Week, CurrencyDollar, Newspaper } from "react-bootstrap-icons";
import { CompanyWithValuations } from "../lib/prismaModels";
import { useSession } from "next-auth/react";

const CompaniesComponent = () => {
  const { data: session } = useSession();
  const [companies, setCompanies] = useState<CompanyWithValuations[]>([]);
  useEffect(() => {
    if(session) {
      companiesAPI.getWithValuations(1).then((companies) => {
        setCompanies(companies);
      });
    }
  }, []);

  return (
    <>
      <Container>

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
            {companies.map(c => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>
                  <div>
                    {c.ddmValuations.length > 0 &&
                      new Date(c.ddmValuations[0].date).toDateString() || "-"}
                  </div>
                </td>
                <td>
                  <div className="">
                    {c.ddmValuations.length > 0 &&
                      currencyFormatter(c.ddmValuations[0].pvStock) || "-"}
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
                      href={`/companies/${c.id}/diary`}
                      className="mx-auto"
                    >
                      <div className="d-flex align-items-center">
                        <Newspaper className="me-1" /> Event
                      </div>
                    </Button>
                    <Button
                      variant="outline-dark"
                      as="a"
                      href={`/companies/${c.id}/timeline`}
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
