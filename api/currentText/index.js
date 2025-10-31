const { CosmosClient } = require("@azure/cosmos");
const COSMOS_CONN = process.env.COSMOS_DB_CONNECTION;
const COSMOS_DB = process.env.COSMOS_DB_NAME || "voting";
const TEXTS_CONTAINER = process.env.COSMOS_TEXTS_CONTAINER || "texts";

const client = new CosmosClient(COSMOS_CONN);
const db = client.database(COSMOS_DB);
const textsContainer = db.container(TEXTS_CONTAINER);

module.exports = async function (context, req) {
  const querySpec = { query: "SELECT * FROM c WHERE c.active = true ORDER BY c.createdAt DESC" };
  const { resources } = await textsContainer.items.query(querySpec).fetchAll();
  const current = resources && resources.length ? resources[0] : null;
  context.res = { status: 200, body: current };
};
