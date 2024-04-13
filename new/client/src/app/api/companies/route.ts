import prisma from "../../../lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const inc = searchParams.get("include")
  if(inc === "valuations") {
    const companies = await prisma.company.findMany({include: {
      ddmValuations: true,
    }})
    return Response.json(companies);
  } else {
    return Response.json(await prisma.company.findMany());
  }
}

