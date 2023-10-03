function Header() {

    return (
    //  <header className="sticky">
    //     <NavLink to="/"  className="button rounded">
    //       <span className="icon-home"></span>
    //       Home
    //     </NavLink>
    //     <NavLink to="/company" className="button rounded">
    //       Projects
    //     </NavLink>
    //   </header>
        <div className="page-header">
            <div className="row align-items-center mw-100">
                <div className="col">
                    <div className="mb-1">
                        <ol className="breadcrumb" aria-label="breadcrumbs">
                            <li className="breadcrumb-item"><a href="#">Home</a></li>
                            <li className="breadcrumb-item"><a href="#">Library</a></li>
                            <li className="breadcrumb-item active" aria-current="page"><a href="#">Articles</a></li>
                        </ol>
                    </div>
                    <h2 className="page-title">Company Research Platform</h2>
                </div>
                <div className="col-auto">
                    <div className="btn-list">
                        <a href="#" className="btn d-none d-md-inline-flex">
                            <svg xmlns="http://www.w3.org/2000/svg" className="icon" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                <path d="M7 7h-1a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-1" />
                                <path d="M20.385 6.585a2.1 2.1 0 0 0 -2.97 -2.97l-8.415 8.385v3h3l8.385 -8.415z" />
                                <path d="M16 5l3 3" />
                            </svg>
                            Edit
                        </a>
                        <a href="#" className="btn btn-primary">
                            Publish
                        </a>
                    </div>
                </div>
            </div>
        </div>

    )
}

export { Header }