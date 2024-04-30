import mysql from "mysql2/promise";

async function getMysqlConnection() {
  const client = await mysql
    .createConnection({
      host: "localhost",
      user: "root",
      password: "root",
      database: "job",
    })

  client.connect((err) => {
    if (err) throw err;
    console.log("Connected!");
  });

  return {
    client,
    documents: {
      async insert(establisment) {
        const { id, surname, slug, establishment_id } = establisment;
        const query = `INSERT INTO de_para_establishments (id, surname, slug, establishment_id) VALUES (?, ?, ?, ?)`;

        await client.query(query, [id, surname, slug, establishment_id]);
      },
      async deleteAll() {
        const query = "DELETE FROM de_para_establishments";

        await client.query(query);
      },
      async createTable() {
        console.log("CRIANDO A TABELA NO MYSQL...");

        const createDocumentsTableQuery = `CREATE TABLE IF NOT EXISTS de_para_establishments (id VARCHAR(191) PRIMARY KEY, surname VARCHAR(191) NOT NULL, slug VARCHAR(191) NOT NULL, establishment_id VARCHAR(191) NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`;
        await client.query(createDocumentsTableQuery);

        console.log("TABELA CRIADA!");
      },
    },
  };
}
export { getMysqlConnection };
