import prisma from "../../../../lib/prisma";

export async function GET(_: Request, { params }: { params: { slug: number } }) {
  const events = await prisma.stockEvent.findMany({
    where: {
      companyId: params.slug,
    },
  });
  return Response.json(events);
}
