# Various investing utilities

This is my repo with pretty-much failed attempts to build an investing framework.

The repo contains a lot of "start-over" commits, typically occuring when I decide to abandon
one idea and move to the next.

Here's a list of what you can find, in reverse chronological order. Simply check out at one of the branches below:

1. Growth stock picker and simulator (https://github.com/michalismeng/investing/tree/growth-simulator).

2. Another attempt to DCF-based valuation and news-keeping for individual companies (https://github.com/michalismeng/investing/tree/another-dcf).

3. Application to aid with DCF-based valuations. Data taken from SEC api. (https://github.com/michalismeng/investing/tree/dcf-sec)

Feel free to also check out another investing-related repo, regarding dividend paying companies: https://github.com/michalismeng/dividend-search.

Find below all the READMEs in a single place.

## 1. Growth stock trading advisor

### How to

1. Install latest .NET https://dotnet.microsoft.com/en-us/download.
2. Set up a MySQL database and change the connection string in `ApplicationDbContext.cs`.
3. Seed the database, see below.
4. Run `dotnet watch run`.

### Seed the database

1. Run the `relative-strength` Python program to get prices from YFinance.
2. See `Program.cs` for the different env vars you can set to run different initializaiton phases. These must run in order they are defined, because calculations depend on previous results.

---

## 2. Investing App

## Organize your investments - Make valuations - Track your notes

## How to - development

1. Install a MySQL server.
2. Run `npx prisma migrate dev`
3. Run `npm run dev`

## How to - production

1. Run `export VERSION=$(git describe --tags --first-parent --dirty --match "v[0-9]*")`
1. Run `docker build -t investing:${VERSION?} .`
2. Run `docker compose up -d`

## Environment files

The above environments require env variables to properly run. Here is an example file, change accordingly:

```
GITHUB_ID=<id>
GITHUB_SECRET=<secret>
NEXTAUTH_SECRET=<secret>
NEXTAUTH_URL=<url>

DATABASE_URL=mysql://<user>:<password>@<host>:<port>/<db-name>
MYSQL_PASSWORD=<db-password>
```

---

## 3. Investing App

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