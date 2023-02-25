## Investing App

A web application for displaying and processing annual financial statements of public companies. The data comes from the official SEC website: https://www.sec.gov/dera/data/financial-statement-data-sets and is updated every quarter.

The ultimate goal of this project is to:
- Gather financial data about public companies in a single place.
- Build tools to automatically evaluate a company based on performance metrics. Some interesting criteria for long-term competitive companies can be found in the following book:
  [Warren Buffett and the Interpretation of Financial Statements: The Search for the Company with a Durable Competitive Advantage](https://www.amazon.com/Warren-Buffett-Interpretation-Financial-Statements/dp/1416573186).
- Make informed decisions about whether to invest in a company or not, keep track of investing theses and rationales of entering or exiting a position.

#### Roadmap

Development of features happens in iterations. We keep track of the features being developed in a given iteration in issues named "Features for iteration N".

Check out the features list for the currect (first) iteration at: [Features for iteration 1](https://github.com/megis7/investing/issues/1).

### Install the project dependencies

1. Clone the project and go into the project directory.

2. Install the necessary Python libraries for the backend:
   ```bash
   python3 -m pip install -r requirements.txt
   ```

3. Go into the directory of the client:
   ```bash
   cd client
   ```

4. Install the necessary NPM modules for the Angular frontend:
   ```bash
   npm install --force
   ```
   Note: We need to use the `--force` argument to install Angular along with the `flex-layout` package, since Angular v15 has dropped support for it (see https://github.com/angular/flex-layout/issues/1430).

### Download and parse XBRL data

1. List all the available datasets:
   ```bash
   python3 mirror.py --list
   ```
   Note: You can also inspect these datasets directly in the "Data Downloads" section of the official SEC website (https://www.sec.gov/dera/data/financial-statement-data-sets).

2. Download the desired dataset, e.g., 2015q2:
   ```bash
   python3 mirror.py --dataset 2015q2
   ```
   Note: The above command will create a directory, `data/2015q2`, where it will save the downloaded data.

3. Parse and store a dataset from the downloaded folder to the local database:
   ```bash
   python3 parse.py --folder data/2015q2
   ```

### Run the web application

1. Run the server by executing the following command from the project's root directory:
   ```bash
   python3 -m flask --app server.py --debug run
   ```
   Note: The above will run the server in development mode, suitable for local testing.

2. Run the client by excuting the following commands from the project's root directory:
   ```bash
   cd client
   npm start
   ```

3. Navigate to http://localhost:4200.
