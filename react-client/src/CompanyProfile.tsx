import moment from "moment"

function CompanyProfile({ profile }: any) {
    return (
        <div className="datagrid">
            <div className="datagrid-item">
                <div className="datagrid-title">Company</div>
                <div className="datagrid-content">{profile.name}</div>
            </div>
            <div className="datagrid-item">
                <div className="datagrid-title">Date of analysis</div>
                <div className="datagrid-content">{moment(profile.profiles[0].date["$date"]).format("DD MMM YYYY")}</div>
            </div>
            <div className="datagrid-item">
                <div className="datagrid-title">Founded</div>
                <div className="datagrid-content">{moment(profile.profiles[0].founded["$date"]).format("MMM YYYY")}</div>
            </div>
            <div className="datagrid-item">
                <div className="datagrid-title">IPO</div>
                <div className="datagrid-content">{moment(profile.profiles[0].ipo["$date"]).format("MMM YYYY")}</div>
            </div>
            <div className="datagrid-item">
                <div className="datagrid-title">Website</div>
                <div className="datagrid-content"><a target="_blank" href={profile.profiles[0].website} className="badge badge-outline text-azure" style={{ textDecoration: "none" }}>{profile.profiles[0].website}</a></div>
            </div>
            <div className="datagrid-item">
                <div className="datagrid-title">Investor Relations</div>
                <div className="datagrid-content"><a target="_blank" href={profile.profiles[0].irWebsite} className="badge badge-outline text-azure text-start text-wrap text-break" style={{ textDecoration: "none" }}>{profile.profiles[0].irWebsite}</a></div>
            </div>
            <div className="datagrid-item" style={{ gridColumn: "1/-1"}}>
                <div className="datagrid-title">Description</div>
                <div className="datagrid-content">{profile.profiles[0].description}</div>
            </div>
            <div className="datagrid-item">
                <div className="datagrid-title">Products and Services</div>
                <div className="datagrid-content">{profile.profiles[0].prodsAndServices.map((l: string) => (
                    <span className="badge badge-outline text-azure me-1 mb-1 text-wrap text-start text-break">{l}</span>
                ))}</div>
            </div>
            <div className="datagrid-item">
                <div className="datagrid-title">Operations</div>
                <div className="datagrid-content">{profile.profiles[0].locOperations.map((l: string) => (
                    <span className="badge badge-outline text-orange me-1 mb-1">{l}</span>
                ))}</div>
            </div>
            <div className="datagrid-item">
                <div className="datagrid-title">Revenue Generation</div>
                <div className="datagrid-content">{profile.profiles[0].revGeneration}</div>
            </div>
            <div className="datagrid-item">
                <div className="datagrid-title">Sector</div>
                <div className="datagrid-content">{profile.profiles[0].sector}</div>
            </div>
            <div className="datagrid-item" style={{ gridColumn: "1/-1"}}>
                <div className="datagrid-title">Competitors</div>
                <div className="datagrid-content">{profile.profiles[0].competitors.map((l: string) => (
                    <span className="badge badge-outline text-danger me-1 mb-1 text-wrap text-start text-break">{l}</span>
                ))}</div>
            </div>
            <div className="datagrid-item" style={{ gridColumn: "1/-1"}}>
                <div className="datagrid-title">Cyclicality</div>
                <div className="datagrid-content">{profile.profiles[0].cyclical}</div>
            </div>
            <div className="datagrid-item" style={{ gridColumn: "1/-1"}}>
                <div className="datagrid-title">Comment</div>
                <div className="datagrid-content">{profile.profiles[0].comment}</div>
            </div>
        </div>
    )
}

export { CompanyProfile }