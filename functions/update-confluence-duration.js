const { SSMClient, PutParameterCommand } = require("@aws-sdk/client-ssm");
const { okResponse } = require("./util");

const client = new SSMClient();

module.exports.handler = async (event) => {
  const event_body = JSON.parse(event.body);

  const command = new PutParameterCommand({
    Name: process.env.ALERT_DURATION_PARAMETER,
    Type: "String",
    Value: event_body.confluenceDuration.toString(),
    Overwrite: true,
  });

  await client.send(command);

  return okResponse({ confluenceDuration: event_body.confluenceDuration });
};
