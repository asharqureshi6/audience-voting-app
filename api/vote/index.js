const { CosmosClient } = require("@azure/cosmos");
const { v4: uuidv4 } = require("uuid");

const COSMOS_CONN = process.env.COSMOS_DB_CONNECTION;
const COSMOS_DB = process.env.COSMOS_DB_NAME || "voting";
const VOTES_CONTAINER = process.env.COSMOS_VOTES_CONTAINER || "votes";
const client = new CosmosClient(COSMOS_CONN);
const db = client.database(COSMOS_DB);
const votesContainer = db.container(VOTES_CONTAINER);

module.exports = async function (context, req) {
  const { textId, rating } = req.body || {};
  if (!textId || !rating) {
    context.res = { status: 400, body: { error: "textId and rating required" } };
    return;
  }
  const numeric = parseInt(rating, 10);
  if (isNaN(numeric) || numeric < 1 || numeric > 5) {
    context.res = { status: 400, body: { error: "rating must be 1-5" } };
    return;
  }

  const voteDoc = {
    id: uuidv4(),
    textId,
    rating: numeric,
    timestamp: new Date().toISOString()
  };

  await votesContainer.items.create(voteDoc);

  // Optionally broadcast new vote to update results live
  context.bindings.signalRMessages = [{
    target: "newVote",
    arguments: [ { textId, rating: numeric } ]
  }];

  context.res = { status: 200, body: voteDoc };
};
