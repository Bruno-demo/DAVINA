import { MongoClient } from "mongodb";
import { exec } from "child_process";
import util from "util";
import path from "path";

const execPromise = util.promisify(exec);

const dumpDir = path.resolve(__dirname, "../../../dump");

const localHost = "mongo";
const dbName = "skincare";

async function waitForMongoReady() {
  console.log("Waiting for Mongo to be ready...");
  let connected = false;
  while (!connected) {
    try {
      const client = new MongoClient(`mongodb://${localHost}:27017`);
      await client.connect();
      await client.db(dbName).command({ ping: 1 });
      await client.close();
      connected = true;
      console.log("Mongo is ready.");
    } catch {
      console.log("Mongo not ready, retrying...");
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
}

async function seedIfEmpty() {
  await waitForMongoReady();

  const client = new MongoClient(`mongodb://${localHost}:27017`);
  await client.connect();
  const db = client.db(dbName);
  const collections = await db.listCollections().toArray();

  if (collections.length === 0) {
    console.log("DB empty, restoring data from dump...");

    await execPromise(
      `mongorestore --host=${localHost} --db=${dbName} --drop "${dumpDir}/${dbName}"`
    );

    console.log("Restore completed.");
  } else {
    console.log("DB already has data, skipping import.");
  }

  await client.close();
}

export default seedIfEmpty;

if (require.main === module) {
  seedIfEmpty().catch((err: unknown) => {
    console.error("MongoDB seed failed:", err);
    process.exit(1);
  });
}
