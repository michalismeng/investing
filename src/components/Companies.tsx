import { Suspense } from "react";
import { CompanyInTableComponent } from "./CompanyComponent";
import prisma from "../lib/prisma";
import { getServerSession } from "next-auth";
import AddCompanyButtonDialog from "./AddCompanyButtonDialog";

async function CompaniesLoader() {
  const session = await getServerSession();
  const companies = await prisma.company.findMany({
    where: {
      userId: session?.userId ?? undefined,
    },
    include: {
      ddmValuations: true,
    },
  });
  return (
    <>
      {companies.map((c) => (
        <CompanyInTableComponent key={c.id} company={c} />
      ))}
    </>
  );
}

function Skeleton() {
  return (
    <>
      <tr className="border-none">
        <td colSpan={3} className="text-center">
          <span className="loading loading-spinner loading-lg"></span>
        </td>
      </tr>
    </>
  );
}

const CompaniesComponent = () => {
  return (
    <>
      <div className="container flex flex-col justify-between mx-auto">
        <h1 className="text-3xl font-bold text-center mb-4">
          Companies Watchlist
        </h1>
        <AddCompanyButtonDialog />
        <table className="table table-pin-rows">
          <thead>
            <tr>
              <th>Name</th>
              <th>Latest Valuation</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <Suspense fallback={<Skeleton />}>
              <CompaniesLoader />
            </Suspense>
          </tbody>
        </table>
      </div>
    </>
  );
};

export default CompaniesComponent;
