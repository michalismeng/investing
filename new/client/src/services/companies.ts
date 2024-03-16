import { DDMValuation } from "../models/Valuation";

const companiesAPI = {
  get() {
    let vals = JSON.parse(localStorage.getItem("valuations")!) as {
      [name: string]: DDMValuation[];
    };
    return Promise.resolve(
      ["Ahold Delhaize", "Rubis SCA", "Alphabet Inc."].map((n, i) => {
        return {
          name: n,
          id: i + 1,
          valuations: vals[i + 1] ?? [],
        };
      })
    );
  },
};

export default companiesAPI;
