import { OutputData } from "@editorjs/editorjs";
import { DDMValuation } from "./Valuation";

export interface DiaryEntry {
  companyId: number;
  date: Date;
  entry: OutputData;
  type: "Diary";
}

export type ValuationEntry = DDMValuation & { type: "Valuation" };

export type TimelineEntry = DiaryEntry | ValuationEntry;
