import mysql from "mysql2/promise";
import pg from "pg";
const { Client } = pg;

async function getMysqlConnection() {
  const client = await mysql.createConnection({
    host: "172.22.0.3",
    user: "root",
    password: "root",
    database: "job",
  });

  client.connect((err) => {
    if (err) throw err;
    console.log("Connected!");
  });
  return {
    client,
    documents: {
      async insert(person) {
        const { name } = person;
        const query = `INSERT INTO documents (name) VALUES (?)`;

        await client.query(query, [name]);
      },
      async list(page = 1, limit = 100) {
        const offset = (page - 1) * limit;
        const query = `
              SELECT id, name
              FROM documents
              ORDER BY id`;

        const [rows, fields] = await client.query(query, [limit, offset]);
        return rows;
      },
      async count() {
        const query = "SELECT COUNT(id) as total FROM documents";

        const [result, fields] = await client.query(query);
        return result[0].total;
      },
      async deleteAll() {
        const query = "DELETE FROM documents";

        await client.query(query);
      },
      async createTable() {
        const createDocumentsTableQuery = `CREATE TABLE IF NOT EXISTS documents (id SERIAL PRIMARY KEY, name VARCHAR(255) NOT NULL)`;
        await client.query(createDocumentsTableQuery);
      },
    },
  };
}
async function getPostgresConnection() {
  const client = new Client({
    user: "root",
    host: "localhost",
    database: "job",
    password: "root",
    port: 5432,
  });

  await client.connect();
  return {
    client,
    documents: {
      async insert(person) {
        const { name } = person;
        const query = `INSERT INTO public.documents (name) VALUES ($1)`;
        await client.query(query, [name]);
      },
      async list(limit = 100) {
        const query = "SELECT * FROM documents LIMIT ?";
        const values = [limit];

        const result = await client.query(query, values);
        return result.rows;
      },
      async count() {
        const query = "SELECT COUNT(id) as total FROM public.documents";

        const {rows} = await client.query(query);
        return Number(rows[0].total);
      },
      async deleteAll() {
        const query = "DELETE FROM documents";

        await client.query(query);
      },
      async createTable() {
        const createDocumentsTableQuery = `
                        CREATE TABLE IF NOT EXISTS documents (
                            id SERIAL PRIMARY KEY,
                            name VARCHAR(255) NOT NULL,
                            registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                        )`;
        await client.query(createDocumentsTableQuery);
      },
    },
  };
}
export { getMysqlConnection, getPostgresConnection };
