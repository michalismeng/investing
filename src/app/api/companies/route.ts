import { Prisma } from "@prisma/client";
import prisma from "../../../lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const inc = searchParams.get("include");
  const user = searchParams.get("user");

  const companies = await prisma.company.findMany({
    where: {
      userId: user ?? undefined,
    },
    include: {
      ddmValuations: inc === "valuations",
    },
  });
  return Response.json(companies);
}

export async function POST(request: Request) {
  const company = (await request.json()) as Prisma.CompanyUncheckedCreateInput;

  const companies = await prisma.company.create({
    data: company,
  });
  return Response.json(companies);
}
