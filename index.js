import { initialize } from "./cluster.js";
import { getMysqlConnection, getPostgresConnection } from "./db.js";
import cliProgress from "cli-progress";
import { setTimeout } from "node:timers/promises";
const postgresDB = await getPostgresConnection();
const mysql = await getMysqlConnection();
const ITEMS_PER_PAGE = 1000;
const CLUSTER_SIZE = 90;
const TASK_FILE = new URL("./background-task.js", import.meta.url).pathname;



async function* getAllPagedData(itemsPerPage, page = 1) {
  const items = await mysql.documents.list(page, itemsPerPage)
  if (!items?.length) return;

  yield items;

  yield* getAllPagedData(itemsPerPage, (page += itemsPerPage));
} 

const total = await mysql.documents.count();
console.log(`TOTAL DE ITENS: ${total}`);

const progress = new cliProgress.SingleBar(
  {
    format: "progress [{bar}] {percentage}% | {value}/{total} | {duration}s",
    clearOnComplete: false,
  },
  cliProgress.Presets.shades_classic
);

progress.start(total, 0);

let totalProcessed = 0;

const cp = initialize({
  backgroundTaskFile: TASK_FILE,
  clusterSize: CLUSTER_SIZE,
  amountToBeProcessed: total,
  async onMessage(message) {
    progress.increment();

    if (++totalProcessed !== total) return;
    progress.stop();
    cp.killAll();

    const totalInserted = await postgresDB.documents.count();
    
    console.log(
      `Total on Mysql ${total} and Total on Postgres ${totalInserted}`
    );
    console.log(`are the same? ${total === totalInserted ? "yes" : "no"}`);
    process.exit();
  },
});
await setTimeout(1000);


for await (const data of getAllPagedData(ITEMS_PER_PAGE)) {
  cp.sendToChild(data);
}