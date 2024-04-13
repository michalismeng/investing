import { OutputData } from "@editorjs/editorjs";
import { DDMValuation } from "@prisma/client";

export interface DiaryEntry {
  companyId: number;
  date: Date;
  entry: OutputData;
  type: "Diary";
}

export type ValuationEntry = DDMValuation & { type: "Valuation" };

export type TimelineEntry = DiaryEntry | ValuationEntry;
