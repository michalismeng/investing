import { useEffect, useState } from "react";
import { companiesAPI } from "./companiesAPI";
import { IconWorldDownload } from "@tabler/icons-react";

function FinancialsSourceModal(props: { modalName: string, company: any, navigate: (to: string) => void }) {

    const [facts, setFacts] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [fmpQueryInput, setfmpQueryInput] = useState<string>("");

    useEffect(() => {
        async function loadData() {
            if (props.company != null) {
                setLoading(true)
                setfmpQueryInput("")
                try {
                    const res = await companiesAPI.getFinancialsLight(props.company.name)
                    setFacts(res)
                } catch (e) {
                    console.warn(e)
                } finally {
                    setLoading(false)
                }
            }
        }

        loadData();
    }, [props.company])

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
        let result = await companiesAPI.fetchFMPData(props.company.name, JSON.parse(fmpQueryInput));
        console.log(result)
        return false
    }

    return (
        <div className="modal" id={props.modalName} tabIndex={-1}>
            <div className="modal-dialog" role="document">
                <div className="modal-content">
                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    <div className="modal-header">
                        <h5 className="modal-title">Select source to draw financials for {props.company?.name}</h5>
                        <p></p>
                    </div>
                    <div className="modal-body p-0">
                        <div className="card" style={{ borderWidth: "0" }}>
                            <div className="card-header">
                                <ul className="nav nav-tabs card-header-tabs" data-bs-toggle="tabs">
                                    <li className="nav-item">
                                        <a href="#tabs-from-cache" className="nav-link active" data-bs-toggle="tab">Local Cache</a>
                                    </li>
                                    <li className="nav-item">
                                        <a href="#tabs-from-tikr-fmp" className="nav-link" data-bs-toggle="tab">TIKR FMP</a>
                                    </li>
                                </ul>
                            </div>
                            <div className="card-body">
                                <div className="tab-content">
                                    <div className="tab-pane active show" id="tabs-from-cache">
                                        {loading ? (
                                            <div style={{ minHeight: "252px" }} className="w-100 h-100 d-flex">
                                                <div className="spinner-border m-auto" role="status"></div>
                                            </div>
                                        ) : facts.length > 0 ? (
                                            <div className="d-flex flex-column w-100 h-100" style={{ minHeight: "100px" }}>
                                                <p>There are cached financial statements from {Math.min(...facts.map(f => f.calendarYear))} to {Math.max(...facts.map(f => f.calendarYear))}.</p>
                                                <button onClick={() => props.navigate(`/companies/${props.company?.name}/IS`)} data-bs-dismiss="modal" className="btn btn-primary ms-auto mt-auto d-flex flex-row justify-content-center align-items-center">
                                                    <div className="me-2">
                                                        Use cached statements
                                                    </div>
                                                    <span>
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-arrow-right p-0 m-0" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                                            <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                                            <path d="M5 12l14 0"></path>
                                                            <path d="M13 18l6 -6"></path>
                                                            <path d="M13 6l6 6"></path>
                                                        </svg>
                                                    </span>
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="empty">
                                                <div className="empty-icon">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="icon" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                                        <circle cx="12" cy="12" r="9" />
                                                        <line x1="9" y1="10" x2="9.01" y2="10" />
                                                        <line x1="15" y1="10" x2="15.01" y2="10" />
                                                        <path d="M9.5 15.25a3.5 3.5 0 0 1 5 0" />
                                                    </svg>
                                                </div>
                                                <p className="empty-title">No cached results found</p>
                                                <p className="empty-subtitle text-secondary text-nowrap">
                                                    There are no financial data in the cache for {props.company?.name}.
                                                </p>
                                                <p className="empty-subtitle text-secondary">Use another source to fetch and view financial data.</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="tab-pane" id="tabs-from-tikr-fmp">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export { FinancialsSourceModal };