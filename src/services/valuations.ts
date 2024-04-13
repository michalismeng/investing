import { DDMValuation, Prisma } from "@prisma/client";

const valuationsAPI = {
  async postDDM(valuation: Prisma.DDMValuationUncheckedCreateInput): Promise<DDMValuation> {
    const resp = await fetch("/api/valuations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(valuation),
    });
    return await resp.json() as DDMValuation;
  }
};

export default valuationsAPI;
