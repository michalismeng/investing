import { useState } from "react";
import { companiesAPI } from "./companiesAPI";
import { IconWorldDownload, IconWorldUpload } from "@tabler/icons-react";
import { useParams } from "react-router-dom";

function DownloadFMP() {
    const [facts, setFacts] = useState<any>(null);
    const [fmpResult, setfmpResult] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [fmpQueryInput, setfmpQueryInput] = useState<string>("");

    const { name } = useParams();

    const handleChange = (event: any) => {
        setfmpQueryInput(event.target.value)
    }

    const placeholder = `${JSON.stringify({
        auth: "...",
        companyid: 12345,
        companyname: "xxx, Inc.",
        exchangename: "Nasdaq Global Select",
        exchangesymbol: "NasdaqGS",
        isocode: "USD",
        period: "a",
        primarytickersymbol: "CCC.C",
        test: false,
        tradingitemid: 12345,
    }, null, 2)}\n\nTo find these values, select a company's financials tab on TIKR and inspect the payload of the 'fmp' request.`

    async function fetchFMPdata(e: any) {
        e.preventDefault()
        let result = await companiesAPI.fetchFMPData(name!, JSON.parse(fmpQueryInput));
        let data = {
            "isYears": result["is"].map((x: any) => x.calendarYear),
            "bsYears": result["bs"].map((x: any) => x.calendarYear),
            "cfYears": result["cf"].map((x: any) => x.calendarYear),
        }
        setfmpResult(result)
        setFacts(data)
        return false
    }

    async function cacheFMPdata() {
        await companiesAPI.cacheFMPData(name!, fmpResult);
        return false;
    }

    function getFactsRow(stmt: string): any {
        const getStmt = (stmt: string) => {
            switch(stmt) {
                case "is": return "Income Statement";
                case "bs": return "Balance Sheet";
                case "cf": return "Cashflow Statement";
            }
        }
        return (
            <tr>
                <td>{getStmt(stmt)}</td>
                <td>{Math.min(...facts[stmt + "Years"])}</td>
                <td>{Math.max(...facts[stmt + "Years"])}</td>
            </tr>
    )}

    return (
        <div className="w-100 h100">
            <h1>Get data for {name} from TIKR FMP endpoint</h1>
            <div className="mt-3">
                <form>
                    <label className="form-label">Input Request Payload</label>
                    <textarea style={{ minHeight: "320px" }} className="form-control mb-3" data-bs-toggle="autosize" placeholder={placeholder} value={fmpQueryInput} onChange={handleChange}></textarea>
                    <button type="submit" onClick={fetchFMPdata} className="btn btn-primary ms-auto mt-auto d-flex flex-row justify-content-center align-items-center">
                        <IconWorldDownload stroke={2} />
                        <div className="ms-2">
                            Get data from FMP
                        </div>
                    </button>
                </form>
            </div>

            <div className="mt-3">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Statement</th>
                            <th>Start Year</th>
                            <th>End Year</th>
                        </tr>
                    </thead>
                    <tbody>
                        {facts && getFactsRow("is")}
                        {facts && getFactsRow("bs")}
                        {facts && getFactsRow("cf")}
                    </tbody>
                </table>
            </div>

            <button onClick={cacheFMPdata} className="btn btn-primary ms-auto mt-auto d-flex flex-row justify-content-center align-items-center">
                <IconWorldUpload stroke={2} />
                <div className="ms-2">
                    Cache FMP data
                </div>
            </button>
        </div>
    )
}

export { DownloadFMP };