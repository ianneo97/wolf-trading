const { okResponse } = require("./util");
const {
  DynamoDBClient,
  PutItemCommand,
  GetItemCommand,
  UpdateItemCommand,
  DeleteItemCommand,
} = require("@aws-sdk/client-dynamodb");
const { SSMClient } = require("@aws-sdk/client-ssm");

const client = new DynamoDBClient();
const ssm = new SSMClient();

module.exports.handler = async (event) => {
  const args = JSON.parse(event.body);

  try {
    const ticker = args.ticker;
    const existingTicker = await getTicker(ticker);
    let response;

    if (existingTicker.Item) {
      // const newTtl = Math.round(new Date().getTime() / 1000) + 60;
      const ttl = parseInt(existingTicker.Item.ttl.N);

      if (isWithin4Hours(ttl)) {
        const currentCount = parseInt(existingTicker.Item.count.N) + 1;
        await updateTicker(ticker, currentCount);
        response = {
          ticker: ticker,
          confluence: currentCount,
        };
      } else {
        await deleteTicker(ticker);
        await createTicker(ticker);
        response = {
          ticker: ticker,
          confluence: 1,
        };
      }
    } else {
      await createTicker(ticker);

      response = {
        ticker: ticker,
        confluence: 1,
      };
    }

    return okResponse(response);
  } catch (err) {
    console.error(err);
  }
};

async function createTicker(ticker) {
  const fourHours = 4 * 60 * 60 * 1000;
  const ttl = Math.round(new Date().getTime() / 1000) + fourHours;
  const command = new PutItemCommand({
    TableName: process.env.TABLE_NAME,
    Item: {
      token: { S: ticker },
      count: { N: "1" },
      ttl: { N: ttl.toString() },
    },
  });

  return await client.send(command);
}

async function updateTicker(ticker, currentCount) {
  const command = new UpdateItemCommand({
    TableName: process.env.TABLE_NAME,
    Key: { token: { S: ticker } },
    AttributeUpdates: {
      count: {
        Action: "PUT",
        Value: { N: currentCount.toString() },
      },
    },
  });

  return await client.send(command);
}

async function getTicker(ticker) {
  const command = new GetItemCommand({
    TableName: process.env.TABLE_NAME,
    Key: {
      token: { S: ticker },
    },
  });

  return await client.send(command);
}

async function deleteTicker(ticker) {
  const command = new DeleteItemCommand({
    TableName: process.env.TABLE_NAME,
    Key: {
      token: { S: ticker },
    },
  });

  return await client.send(command);
}

function isWithin4Hours(timestamp) {
  const now = new Date().getTime();
  const givenTime = new Date(timestamp * 1000).getTime();
  const fourHours = 4 * 60 * 60 * 1000;

  return givenTime >= now && givenTime <= now + fourHours;
}
