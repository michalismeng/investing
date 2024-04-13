import { Prisma } from "@prisma/client"

export type CompanyWithValuations = Prisma.CompanyGetPayload <{
  include: { ddmValuations: true }
}>

export type CompanyWithValuationsAndEvents = Prisma.CompanyGetPayload <{
  include: { ddmValuations: true, events: true }
}>