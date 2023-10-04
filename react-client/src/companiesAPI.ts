function translateStatusToErrorMessage(status: number) {
  switch (status) {
    case 401:
      return 'Please login again.';
    case 403:
      return 'You do not have permission to view the project(s).';
    default:
      return 'There was an error retrieving the project(s). Please try again.';
  }
}

function checkStatus(response: any) {
  if (response.ok) {
    return response;
  } else {
    const httpErrorInfo = {
      status: response.status,
      statusText: response.statusText,
      url: response.url,
    };
    console.log(`log server http error: ${JSON.stringify(httpErrorInfo)}`);

    let errorMessage = translateStatusToErrorMessage(httpErrorInfo.status);
    throw new Error(errorMessage);
  }
}

function parseJSON(response: Response) {
  return response.json();
}

const delay = (response: Response, ms: number) => new Promise(resolve => setTimeout(() => resolve(response), ms));

const companiesAPI = {
  getCompany(name: string) {
    return fetch(`/api/companies/${name}`)
      .then(checkStatus)
      .then(parseJSON)
      .catch((error: TypeError) => {
        console.log('log client error ' + error);
        throw new Error(
          'There was an error retrieving the projects. Please try again.'
        );
      });
  },
  get() {
    return fetch(`/api/companies`)
      .then(checkStatus)
      .then(parseJSON)
      .catch((error: TypeError) => {
        console.log('log client error ' + error);
        throw new Error(
          'There was an error retrieving the projects. Please try again.'
        );
      });
  },
  getFinancials(name: string, stmt: string) {
    return fetch(`/api/companies/${name}/financials/${stmt}/detailed`)
      .then(checkStatus)
      .then(parseJSON)
      .catch((error: TypeError) => {
        console.log('log client error ' + error);
        throw new Error(
          'There was an error retrieving the projects. Please try again.'
        );
      });
  },
  getFinancialsLight(name: string) {
    return fetch(`/api/companies/${name}/financials`)
      .then((response) => delay(response, 500))
      .then(checkStatus)
      .then(parseJSON)
      .catch((error: TypeError) => {
        console.log('log client error ' + error);
        throw new Error(
          'There was an error retrieving the projects. Please try again.'
        );
      });

  },
  fetchFMPData(name: string, payload: any) {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name, payload: payload })
    };
    return fetch(`/api/fetch-tikr-fmp`, requestOptions)
      .then((response) => delay(response, 500))
      .then(checkStatus)
      .then(parseJSON)
      .catch((error: TypeError) => {
        console.log('log client error ' + error);
        throw new Error(
          'There was an error retrieving the projects. Please try again.'
        );
      });
  },
  cacheFMPData(name: string, payload: any) {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name, payload: payload })
    };
    return fetch(`/api/cache-tikr-fmp`, requestOptions)
      .then((response) => delay(response, 500))
      .then(checkStatus)
      .then(parseJSON)
      .catch((error: TypeError) => {
        console.log('log client error ' + error);
        throw new Error(
          'There was an error retrieving the projects. Please try again.'
        );
      });
  },
  deleteFMPData(name: string) {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name })
    };
    return fetch(`/api/delete-tikr-fmp`, requestOptions)
      .then((response) => delay(response, 500))
      .then(checkStatus)
      .then(parseJSON)
      .catch((error: TypeError) => {
        console.log('log client error ' + error);
        throw new Error(
          'There was an error retrieving the projects. Please try again.'
        );
      });

  }

};

export { companiesAPI }
