# Investing App

## Organize your investments - Make valuations - Track your notes

## How to - development

1. Install a MySQL server.
2. Run `npx prisma migrate dev`
3. Run `npm run dev`

## How to - production

1. Run `docker build -t investing .`
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