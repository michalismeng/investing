import { Prisma } from "@prisma/client";
import prisma from "../../../lib/prisma";

export async function POST(req: Request) {
  const event = (await req.json()) as Prisma.StockEventUncheckedCreateInput;
  const created = await prisma.stockEvent.create({
    data: event,
  });
  return Response.json(created);
}