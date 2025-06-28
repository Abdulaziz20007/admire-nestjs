import { Client } from "pg";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL is not defined in .env file");
  process.exit(1);
}

const dbUrl = new URL(connectionString);
const dbName = dbUrl.pathname.slice(1);

dbUrl.pathname = "postgres";
const maintenanceConnectionString = dbUrl.toString();

const client = new Client({ connectionString: maintenanceConnectionString });

async function createDbIfNotExists() {
  try {
    await client.connect();
    const res = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName],
    );
    if (res.rowCount === 0) {
      console.log(`Database "${dbName}" not found. Creating...`);
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log(`Database "${dbName}" created successfully.`);
    } else {
      console.log(`Database "${dbName}" already exists.`);
    }
  } catch (error) {
    console.error("Error creating database:", error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

createDbIfNotExists();
