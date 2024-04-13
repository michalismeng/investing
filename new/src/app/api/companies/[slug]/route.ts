import prisma from "../../../../lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { slug: number } }
) {
  const { searchParams } = new URL(request.url);
  const inc = (searchParams.get("include") || "").split("+");
  const companies = await prisma.company.findUnique({
    where: {
      id: +params.slug,
    },
    include: {
      ddmValuations: inc.includes("valuations"),
      events: inc.includes("events"),
    },
  });
  return Response.json(companies);
}
