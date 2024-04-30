import XLSX from "xlsx";
import { getMysqlConnection } from "./db.js";
import { v4 as uuidv4 } from "uuid";

export function readExcelFile(caminhoArquivo) {
  console.log("INICIANDO LEITURA DO EXCEL...");

  const workbook = XLSX.readFile(caminhoArquivo);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  console.log("LETURA FINALIZADA LEITURA DO EXCEL!");
  return XLSX.utils.sheet_to_json(worksheet, { header: 1 });
}

export function extractId(url) {
  if (!url) {
    console.log("NÃO EXISTE URL NESSE REGISTRO!");
    return;
  }
  const regex = /\/u\/([a-f0-9]+)\//;
  const match = url.match(regex);
  if (match && match.length > 1) {
    return match[1];
  } else {
    return null;
  }
}

function formatSlug(string) {
  const semEspacos = string.replace(/\s+/g, "-");
  const semCaracteresEspeciais = semEspacos
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  const resultado = semCaracteresEspeciais.replace(/[^a-z0-9-]/g, "");
  return resultado;
}

async function main() {
  const data = readExcelFile("./src/import-excel/assets/file.xlsx");
  data.shift();
  const mysql = await getMysqlConnection();
  await mysql.documents.createTable();

  for (const d of data) {
    await mysql.documents.insert({
      id: uuidv4(),
      surname: d[0],
      slug: formatSlug(d[0] + " " + d[1]),
      establishment_id: extractId(d[4]),
    });
  }
  console.log("FIM DA IMPORTAÇÃO!");
  return;
}

await main();
