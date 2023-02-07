const { okResponse } = require("./util");
const { DynamoDBClient, GetItemCommand } = require("@aws-sdk/client-dynamodb");

const client = new DynamoDBClient();

module.exports.handler = async (event) => {
  const args = event.pathParameters;

  try {
    const ticker = args.ticker;
    const item = await getTicker(ticker);

    return okResponse({
      ticker: ticker,
      confluence: item.Item ? parseInt(item.Item.count.N) : 0,
    });
  } catch (err) {
    return okResponse({ message: "Hello World" });
  }
};

async function getTicker(ticker) {
  const command = new GetItemCommand({
    TableName: process.env.TABLE_NAME,
    Key: {
      token: { S: ticker },
    },
  });

  return await client.send(command);
}
