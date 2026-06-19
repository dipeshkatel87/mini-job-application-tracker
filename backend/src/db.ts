import fs from "node:fs";
import path from "node:path";
import initSqlJs, { Database, SqlValue } from "sql.js";
import type { ApplicationFormData } from "./types.js";

export type DbApplication = {
  id: number;
  companyName: string;
  jobTitle: string;
  jobType: string;
  status: string;
  appliedDate: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

const dataDir = path.resolve(process.env.DATA_DIR ?? "data");
const dbPath = path.resolve(process.env.DATABASE_FILE ?? path.join(dataDir, "applications.db"));
const schemaPath = path.resolve("database", "schema.sql");

let databasePromise: Promise<Database> | null = null;

function ensureDataDir() {
  fs.mkdirSync(dataDir, { recursive: true });
}

function persist(db: Database) {
  ensureDataDir();
  fs.writeFileSync(dbPath, Buffer.from(db.export()));
}

function mapResultRow(columns: string[], values: SqlValue[]): DbApplication {
  const row = Object.fromEntries(columns.map((column, index) => [column, values[index]]));

  return {
    id: Number(row.id),
    companyName: String(row.company_name),
    jobTitle: String(row.job_title),
    jobType: String(row.job_type),
    status: String(row.status),
    appliedDate: String(row.applied_date),
    notes: row.notes === null ? null : String(row.notes),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at)
  };
}

export async function getDb() {
  if (!databasePromise) {
    databasePromise = (async () => {
      ensureDataDir();
      const SQL = await initSqlJs();
      const fileBuffer = fs.existsSync(dbPath) ? fs.readFileSync(dbPath) : undefined;
      const db = new SQL.Database(fileBuffer);
      db.run(fs.readFileSync(schemaPath, "utf8"));
      persist(db);
      return db;
    })();
  }

  return databasePromise;
}

export async function initializeDatabase() {
  await getDb();
}

export async function listApplications(filters: { status?: string; search?: string }) {
  const db = await getDb();
  const where: string[] = [];
  const params: SqlValue[] = [];

  if (filters.status) {
    where.push("status = ?");
    params.push(filters.status);
  }

  if (filters.search) {
    where.push("(company_name LIKE ? OR job_title LIKE ?)");
    params.push(`%${filters.search}%`, `%${filters.search}%`);
  }

  const result = db.exec(
    `
      SELECT * FROM applications
      ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
      ORDER BY applied_date DESC, id DESC
    `,
    params
  )[0];

  return result?.values.map((values) => mapResultRow(result.columns, values)) ?? [];
}

export async function getApplication(id: number) {
  const db = await getDb();
  const result = db.exec("SELECT * FROM applications WHERE id = ?", [id])[0];
  if (!result?.values.length) return null;

  return mapResultRow(result.columns, result.values[0]);
}

export async function createApplication(data: ApplicationFormData) {
  const db = await getDb();
  db.run(
    `
      INSERT INTO applications (company_name, job_title, job_type, status, applied_date, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    [data.companyName, data.jobTitle, data.jobType, data.status, data.appliedDate, data.notes || null]
  );
  const id = Number(db.exec("SELECT last_insert_rowid() AS id")[0].values[0][0]);
  persist(db);
  return getApplication(id);
}

export async function updateApplication(id: number, data: Partial<ApplicationFormData>) {
  const db = await getDb();
  const entries = Object.entries({
    company_name: data.companyName,
    job_title: data.jobTitle,
    job_type: data.jobType,
    status: data.status,
    applied_date: data.appliedDate,
    notes: data.notes === "" ? null : data.notes
  }).filter(([, value]) => value !== undefined);

  if (!entries.length) return getApplication(id);

  const assignments = entries.map(([column]) => `${column} = ?`).join(", ");
  db.run(`UPDATE applications SET ${assignments} WHERE id = ?`, [...entries.map(([, value]) => value as SqlValue), id]);
  persist(db);
  return getApplication(id);
}

export async function deleteApplication(id: number) {
  const db = await getDb();
  db.run("DELETE FROM applications WHERE id = ?", [id]);
  persist(db);
}
