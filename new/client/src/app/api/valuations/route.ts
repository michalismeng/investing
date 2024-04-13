import { Prisma } from "@prisma/client";
import prisma from "../../../lib/prisma";

export async function POST(req: Request) {
  const valuation = (await req.json()) as Prisma.DDMValuationUncheckedCreateInput;
  await prisma.dDMValuation.create({
    data: valuation,
  });
  return Response.json("created");
}
