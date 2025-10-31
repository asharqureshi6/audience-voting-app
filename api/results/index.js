const { CosmosClient } = require("@azure/cosmos");
const COSMOS_CONN = process.env.COSMOS_DB_CONNECTION;
const COSMOS_DB = process.env.COSMOS_DB_NAME || "voting";
const TEXTS_CONTAINER = process.env.COSMOS_TEXTS_CONTAINER || "texts";
const VOTES_CONTAINER = process.env.COSMOS_VOTES_CONTAINER || "votes";

const client = new CosmosClient(COSMOS_CONN);
const db = client.database(COSMOS_DB);
const textsContainer = db.container(TEXTS_CONTAINER);
const votesContainer = db.container(VOTES_CONTAINER);

module.exports = async function (context, req) {
  // Get current text
  const { resources: texts } = await textsContainer.items.query({
    query: "SELECT * FROM c WHERE c.active = true ORDER BY c.createdAt DESC"
  }).fetchAll();
  const current = texts && texts.length ? texts[0] : null;
  if (!current) {
    context.res = { status: 200, body: { current: null, votes: [], count: 0, average: 0 } };
    return;
  }

  // Get votes for text
  const { resources: votes } = await votesContainer.items.query({
    query: "SELECT c.rating FROM c WHERE c.textId = @textId",
    parameters: [
      { name: "@textId", value: current.id }
    ]
  }).fetchAll();

  const ratings = votes.map(v => v.rating);
  const count = ratings.length;
  const average = count ? (ratings.reduce((a,b)=>a+b,0) / count) : 0;

  context.res = { status: 200, body: { current, votes: ratings, count, average } };
};
