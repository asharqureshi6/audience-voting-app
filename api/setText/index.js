const { CosmosClient } = require("@azure/cosmos");
const { v4: uuidv4 } = require("uuid");

const COSMOS_CONN = process.env.COSMOS_DB_CONNECTION;
const COSMOS_DB = process.env.COSMOS_DB_NAME || "voting";
const TEXTS_CONTAINER = process.env.COSMOS_TEXTS_CONTAINER || "texts";

const client = new CosmosClient(COSMOS_CONN);
const db = client.database(COSMOS_DB);
const textsContainer = db.container(TEXTS_CONTAINER);

module.exports = async function (context, req) {
  const { text } = req.body || {};
  if (!text || text.trim() === "") {
    context.res = { status: 400, body: { error: "text is required" } };
    return;
  }

  // Deactivate any active text
  const querySpec = { query: "SELECT * FROM c WHERE c.active = true" };
  const { resources: active } = await textsContainer.items.query(querySpec).fetchAll();
  for (const t of active) {
    t.active = false;
    await textsContainer.item(t.id, t.id).replace(t).catch(()=>{});
  }

  const newText = {
    id: uuidv4(),
    text,
    active: true,
    createdAt: new Date().toISOString()
  };

  await textsContainer.items.create(newText);

  // Broadcast the new text to all connected clients via SignalR
  context.bindings.signalRMessages = [
    {
      "target": "newText",
      "arguments": [newText]
    }
  ];

  context.res = { status: 200, body: newText };
};
