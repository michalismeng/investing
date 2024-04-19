import { Company, Prisma } from "@prisma/client";
import {
  CompanyWithValuations,
  CompanyWithValuationsAndEvents,
} from "../lib/prismaModels";

const companiesAPI = {
  async get() {
    const resp = await fetch(`/api/companies`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return (await resp.json()) as Company[];
  },

  async getById(id: number) {
    const resp = await fetch(`/api/companies/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return (await resp.json()) as Company;
  },

  async getByIdWithValuations(id: number) {
    const resp = await fetch(`/api/companies/${id}?include=valuations`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return (await resp.json()) as CompanyWithValuations;
  },

  async getWithValuations(userId: string | undefined = undefined) {
    let url = `/api/companies?include=valuations`;
    if (userId) {
      url += `&user=${userId}`;
    }
    const resp = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return (await resp.json()) as CompanyWithValuations[];
  },

  async getByIdWithValuationsAndEvents(id: number) {
    const resp = await fetch(
      `/api/companies/${id}?include=valuations${encodeURIComponent("+")}events`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return (await resp.json()) as CompanyWithValuationsAndEvents;
  },

  async post(company: Prisma.CompanyUncheckedCreateInput) {
    const resp = await fetch(`/api/companies`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(company),
    });
    return (await resp.json()) as Company;
  }
};

export default companiesAPI;
