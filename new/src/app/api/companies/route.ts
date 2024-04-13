import prisma from "../../../lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const inc = searchParams.get("include");
  const user = searchParams.get("user");

  const companies = await prisma.company.findMany({
    where: {
      userId: user ? +user : undefined,
    },
    include: {
      ddmValuations: inc === "valuations",
    },
  });
  return Response.json(companies);
}
