import { Prisma, StockEvent } from "@prisma/client";

const eventsAPI = {
  async post(evt: Prisma.StockEventUncheckedCreateInput): Promise<StockEvent> {
    const resp = await fetch("/api/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(evt),
    });
    return await resp.json() as StockEvent;
  },

  async getByCompanyId(companyId: number): Promise<StockEvent[]> {
    const resp = await fetch(`/api/events/${companyId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const events = await resp.json() as StockEvent[];
    return events;
  },
};

export default eventsAPI;
