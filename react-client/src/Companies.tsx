import { useEffect, useState } from "react";
import { companiesAPI } from "./companiesAPI";
import { NavLink, useNavigate } from "react-router-dom";
import { CompanyProfile } from "./CompanyProfile";
import { FinancialsSourceModal } from "./FinancialsSourceModal";
import { IconTrash, IconWorldDownload, IconZoomMoney } from "@tabler/icons-react";

function Companies() {
    const [companies, setCompanies] = useState<any[]>([]);
    const [error, setError] = useState<string | undefined>(undefined);
    const [loading, setLoading] = useState(false);
    const [profile, setProfile] = useState<any | null>(null);
    const [selectedCompany, setSelectedCompany] = useState<any | null>(null);

    useEffect(() => {
        async function loadCompanies() {
            setLoading(true);
            try {
                const data = await companiesAPI.get();
                setCompanies(data)
                setError('');
            } catch (e) {
                if (e instanceof Error) {
                    setError(e.message)
                }
            } finally {
                setLoading(false);
            }
        }
        loadCompanies();
    }, [])

    async function deleteFMPData(name: string) {
        setProfile(null)
        try {
            const data = await companiesAPI.deleteFMPData(name);
        } catch (e) {
            if (e instanceof Error) {
                setError(e.message)
            }
        } finally {
            setLoading(false);
        }
    }

    async function loadProfile(name: string) {
        setProfile(null)
        try {
            const data = await companiesAPI.getCompany(name);
            setProfile(data)
        } catch (e) {
            if (e instanceof Error) {
                setError(e.message)
            }
        } finally {
            setLoading(false);
        }
    }

    const financialsSourceInput: string = "financialsSourceInput";
    const createID = (str: string) => `#${str}`;
    const navigate = useNavigate();

    return (
        <div className="d-flex flex-row flex-wrap" style={{width: "100%", height: "100%"}}>
            <FinancialsSourceModal modalName={financialsSourceInput} company={selectedCompany} navigate={navigate}></FinancialsSourceModal>
            {profile &&
            <div className="d-flex flex-column mt-auto ms-auto me-auto col-md-6 h-100">
                <h2 className="text-center">&nbsp; </h2>
                <div className="fixed border border-3 p-3" style={{ borderRadius: "10px" }}>
                    <CompanyProfile profile={profile} />
                </div>
            </div>
            }
            <div className="d-flex flex-column mt-auto ms-auto me-auto col-md-5 h-100">
                <h2 className="text-center">Watchlist Companies</h2>
                <div className="shadow-lg bg-white fixed">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {companies.map(c => 
                                <tr key={c.name}>
                                    <td className="align-middle" key={c.name}>{c.name}</td>
                                    <td>
                                        <div className="d-flex flex-row">
                                            <button onClick={() => loadProfile(c.name)}  className="btn btn-icon me-2" style={{transform: "scale(0.9"}}>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-user-circle" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                                   <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                                   <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"></path>
                                                   <path d="M12 10m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"></path>
                                                   <path d="M6.168 18.849a4 4 0 0 1 3.832 -2.849h4a4 4 0 0 1 3.834 2.855"></path>
                                                </svg>
                                            </button>
                                            <NavLink to={"/companies/" + c.name + "/fmp"} className="btn btn-icon" style={{transform: "scale(0.9"}}>
                                                <IconZoomMoney stroke={1}/>
                                            </NavLink>
                                            <NavLink to={"/companies/" + c.name + "/download-fmp"} className="btn btn-icon" style={{transform: "scale(0.9"}}>
                                                <IconWorldDownload stroke={1} />
                                            </NavLink>
                                            <button onClick={() => deleteFMPData(c.name)}  className="btn btn-icon me-2" style={{transform: "scale(0.9"}}>
                                                <IconTrash stroke={1}/>
                                            </button>
                                        </div>
                                    </td>
                                </tr>    
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export { Companies }