const { SSMClient, PutParameterCommand } = require("@aws-sdk/client-ssm");
const { okResponse } = require("./util");

const client = new SSMClient();

module.exports.handler = async (event) => {
  const event_body = JSON.parse(event.body);
  const command = new PutParameterCommand({
    Name: process.env.ALERT_PARAMETER,
    Type: "String",
    Value: event_body.alertStatus ? "true" : "false",
    Overwrite: true,
  });

  await client.send(command);

  return okResponse({ alertStatus: event_body.alertStatus });
};
