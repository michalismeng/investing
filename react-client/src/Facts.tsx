import './Facts.css'
import { useEffect, useState } from "react";
import moment from "moment";
import { transform as amountify } from "./amountify"
import { companiesAPI } from './companiesAPI';
import { useParams } from 'react-router-dom';

function Facts() {
    const [factsIncome, setFactsIncome] = useState<{"data": any[], "columns": string[]}>({"data": [], "columns": []});
    const [factsBalance, setFactsBalance] = useState<{"data": any[], "columns": string[]}>({"data": [], "columns": []});
    const [factsCashflows, setFactsCashflows] = useState<{"data": any[], "columns": string[]}>({"data": [], "columns": []});
    const [selectedFacts, setSelectedFacts] = useState<any[]>([]);
    // const [columns, setColumns] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | undefined>(undefined);

    const { name, stmt } = useParams();

    function getColumnsFromData(data: any[]): string[] {
        const columns = Object.keys(data[0])
        let dynamicColumns = columns.filter(c => staticColumns.includes(c) == false)
        return [...staticColumnsRender, ...dynamicColumns];
    }

    useEffect(() => {
        async function loadFacts() {
            setLoading(true);
            try {
                const income = await companiesAPI.getFinancials(name!, "IS");
                const balance = await companiesAPI.getFinancials(name!, "BS");
                const cashflow = await companiesAPI.getFinancials(name!, "CF");
                setFactsIncome({"data": income, "columns": getColumnsFromData(income)});
                setFactsBalance({"data": balance, "columns": getColumnsFromData(income)});
                setFactsCashflows({"data": cashflow, "columns": getColumnsFromData(income)});
                setError('');
            } catch (e) {
                if (e instanceof Error) {
                    setError(e.message)
                }
            } finally {
                setLoading(false);
            }
        }
        loadFacts();
    }, [])

    const staticColumns = ["tag", "line", "uom", "plabel", "report"]
    const staticColumnsRender = ["plabel"]

    function parseDate(column: string): string {
        if (staticColumns.includes(column)) return column;
        return moment(column).format("MMM YYYY")
    }

    function wordize(word: string): string {
        return word.replace(/([A-Z]+)([A-Z]+)/g, ' $1$2').trim().replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase())
    }

    function transform(f: any, c: string): string {
        if (staticColumns.includes(c)) {
            return wordize(f[c])
        }

        return amountify(f[c], f.uom)
    }

    function handleSelected(e: any) {
        const { value, checked } = e.target;
        if (checked == false) {
            let newSelectedFacts = selectedFacts.filter(f => f != value)
            setSelectedFacts(newSelectedFacts)
        } else {
            let newSelectedFacts = [...selectedFacts, value]
            setSelectedFacts(newSelectedFacts)
        }
    }

    return (
        <div className="d-flex flex-column w-100 h-100">
            <h1>Income Statement</h1>
            <table className="table table-vcenter table-nowrap">
                <thead className="sticky-top">
                    <tr>{factsIncome.columns.map(parseDate).map(c => (<th scope="col" key={c}>{c}</th>))}</tr>
                </thead>
                <tbody>
                    {factsIncome.data.map(f => (
                        <tr key={f["tag"]}>{factsIncome.columns.map(c => (
                            c === "plabel" ? (
                                <td className='ps-0 pe-0' key={f["tag"] + c}>
                                    <div className='d-flex flex-row'>
                                        <input className="form-check-input me-2" type="checkbox" value={f["tag"]} onChange={handleSelected} />
                                        <span>{transform(f, c)}</span>
                                    </div>
                                </td>
                            ) : (
                                <td key={f["tag"] + c} data-bs-toggle="tooltip" data-bs-placement="top" title={f["uom"]}>{transform(f, c)}</td>
                            )
                        ))}</tr>
                    ))}
                </tbody>
            </table>

            <h1>Balance Sheet</h1>
            <table className="table table-vcenter table-nowrap">
                <thead className="sticky-top">
                    <tr>{factsBalance.columns.map(parseDate).map(c => (<th scope="col" key={c}>{c}</th>))}</tr>
                </thead>
                <tbody>
                    {factsBalance.data.map(f => (
                        <tr key={f["tag"]}>{factsBalance.columns.map(c => (
                            c === "plabel" ? (
                                <td className='ps-0 pe-0' key={f["tag"] + c}>
                                    <div className='d-flex flex-row'>
                                        <input className="form-check-input me-2" type="checkbox" value={f["tag"]} onChange={handleSelected} />
                                        <span>{transform(f, c)}</span>
                                    </div>
                                </td>
                            ) : (
                                <td key={f["tag"] + c} data-bs-toggle="tooltip" data-bs-placement="top" title={f["uom"]}>{transform(f, c)}</td>
                            )
                        ))}</tr>
                    ))}
                </tbody>
            </table>

            <h1>Cashflow Statement</h1>
            <table className="table table-vcenter table-nowrap">
                <thead className="sticky-top">
                    <tr>{factsCashflows.columns.map(parseDate).map(c => (<th scope="col" key={c}>{c}</th>))}</tr>
                </thead>
                <tbody>
                    {factsCashflows.data.map(f => (
                        <tr key={f["tag"]}>{factsCashflows.columns.map(c => (
                            c === "plabel" ? (
                                <td className='ps-0 pe-0' key={f["tag"] + c}>
                                    <div className='d-flex flex-row'>
                                        <input className="form-check-input me-2" type="checkbox" value={f["tag"]} onChange={handleSelected} />
                                        <span>{transform(f, c)}</span>
                                    </div>
                                </td>
                            ) : (
                                <td key={f["tag"] + c} data-bs-toggle="tooltip" data-bs-placement="top" title={f["uom"]}>{transform(f, c)}</td>
                            )
                        ))}</tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export { Facts };