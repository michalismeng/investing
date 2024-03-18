import { DiaryEntry } from "../models/TimelineEntry";


const diaryAPI = {
  post({ companyId, date, entry, type}: DiaryEntry): Promise<DiaryEntry> {
    let diary = localStorage.getItem("diary");
    if (!diary) localStorage.setItem("diary", JSON.stringify([]));

    let diaryObject = JSON.parse(localStorage.getItem("diary")!) as any[];
    let obj: DiaryEntry = {
      companyId: companyId,
      date: date,
      entry: entry,
      type: type,
    }
    diaryObject.push(obj);
    localStorage.setItem("diary", JSON.stringify(diaryObject));
    return Promise.resolve(obj)
  },

  getById(companyId: number): Promise<DiaryEntry[]> {
    let diary = localStorage.getItem("diary");
    if (!diary) localStorage.setItem("diary", JSON.stringify([]));

    let diaryObject = JSON.parse(localStorage.getItem("diary")!) as DiaryEntry[];
    return Promise.resolve(diaryObject.filter(d => +d.companyId == companyId));
  }
};

export default diaryAPI;

