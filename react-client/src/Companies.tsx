import { useEffect, useState } from "react";
import { companiesAPI } from "./companiesAPI";
import { NavLink } from "react-router-dom";
import { CompanyProfile } from "./CompanyProfile";

function Companies() {
    const [companies, setCompanies] = useState<any[]>([]);
    const [error, setError] = useState<string | undefined>(undefined);
    const [loading, setLoading] = useState(false);
    const [profile, setProfile] = useState<any | null>(null);

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

    return (
        <div className="d-flex flex-row flex-wrap" style={{width: "100%", height: "100%"}}>
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
                                            <NavLink to="/company" className="btn btn-icon me-2" style={{transform: "scale(0.9"}}>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-search" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                                   <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                                   <path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0"></path>
                                                   <path d="M21 21l-6 -6"></path>
                                                </svg>
                                            </NavLink>
                                            <NavLink to="/company" className="btn btn-icon" style={{transform: "scale(0.9"}}>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-trash" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                                   <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                                   <path d="M4 7l16 0"></path>
                                                   <path d="M10 11l0 6"></path>
                                                   <path d="M14 11l0 6"></path>
                                                   <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12"></path>
                                                   <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3"></path>
                                                </svg>
                                            </NavLink>
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