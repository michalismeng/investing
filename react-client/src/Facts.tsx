import './Facts.css'
import { useEffect, useState } from "react";
import { factsAPI } from "./factsAPI";
import moment from "moment";
import { transform as amountify } from "./amountify"

function Facts() {
    const [facts, setFacts] = useState<any[]>([]);
    const [selectedFacts, setSelectedFacts] = useState<any[]>([]);
    const [columns, setColumns] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | undefined>(undefined);

    useEffect(() => {
        async function loadFacts() {
            setLoading(true);
            try {
                const data = await factsAPI.get("IS");
                const columns = Object.keys(data[0]) 
                let dynamicColumns = columns.filter(c => staticColumns.includes(c) == false)
                setColumns([...staticColumnsRender, ...dynamicColumns])
                setError('');
                setFacts(data);
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
        <div className="table-responsive facts-container">
            <table className="table table-vcenter table-nowrap">
                <thead className="sticky-top">
                    <tr>{columns.map(parseDate).map(c => (<th scope="col" key={c}>{c}</th>))}</tr>
                </thead>
                <tbody>
                    {facts.map(f => (
                        <tr key={f["tag"]}>{columns.map(c => (
                            c === "plabel" ? (
                                <td key={f["tag"] + c}>
                                    <div className='d-flex flex-row'>
                                        <input className="form-check-input me-2" type="checkbox" value={f["tag"]} onChange={ handleSelected }/>
                                        <span>{ transform(f, c) }</span>
                                    </div>
                                </td>
                            ) : (
                                <td key={f["tag"] + c} data-bs-toggle="tooltip" data-bs-placement="top" title={f["uom"]}>{ transform(f, c) }</td>
                            )
                        ))}</tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export { Facts };