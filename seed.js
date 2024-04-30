import { faker } from "@faker-js/faker";
import { getPostgresConnection, getMysqlConnection } from "./db.js";

async function seedMysql() {
  const db = await getMysqlConnection();
  await db.documents.createTable();
  // Gerar e inserir dados
  const data = [];
  for (let i = 0; i < 100000; i++) {
    const insertDataQuery =
      `INSERT INTO documents (name) VALUES ('${faker.person.firstName()}');`;
    await db.client.query(insertDataQuery).catch(e=> console.log("Erro ao inserir um registro"));
  }
  
  console.log("Dados inseridos!")
  await db.client.end();
}

async function seedPostegres() {
  const db = await getPostgresConnection();
  console.log("creating table documents");
  await db.documents.createTable();
  console.log("table documents created with success");
  await db.client.end();
}
await seedPostegres();
await seedMysql();
