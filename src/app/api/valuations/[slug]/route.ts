import prisma from "../../../../lib/prisma";

export async function GET(_: Request, { params }: { params: { slug: string } }) {
  const valuations = await prisma.dDMValuation.findMany({
    where: {
      companyId: +params.slug || 0,
    },
  });
  return Response.json(valuations);
}

