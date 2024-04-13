import { Company } from "@prisma/client";
import { CompanyWithValuations, CompanyWithValuationsAndEvents } from "../lib/prismaModels";

const companiesAPI = {
  async get() {
    const resp = await fetch(`/api/companies`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return await resp.json() as Company[];
  },

  async getById(id: number) {
    const resp = await fetch( `/api/companies/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return await resp.json() as Company;
  },

  async getByIdWithValuations(id: number) {
    const resp = await fetch(`/api/companies/${id}?include=valuations`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return await resp.json() as CompanyWithValuations;
  },

  async getWithValuations() {
    const resp = await fetch(`/api/companies?include=valuations`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return await resp.json() as CompanyWithValuations[];
  },

  async getByIdWithValuationsAndEvents(id: number) {
    const resp = await fetch(`/api/companies/${id}?include=valuations${encodeURIComponent("+")}events`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return await resp.json() as CompanyWithValuationsAndEvents;
  },

};

export default companiesAPI;
