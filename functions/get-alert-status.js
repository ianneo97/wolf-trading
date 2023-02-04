const { SSMClient, GetParameterCommand } = require("@aws-sdk/client-ssm");
const { okResponse } = require("./util");

const client = new SSMClient();

module.exports.handler = async (event) => {
  const command = new GetParameterCommand({
    Name: process.env.ALERT_PARAMETER,
  });

  const { Parameter } = await client.send(command);
  const response = Parameter.Value;

  return okResponse({ alertStatus: response === "true" ? true : false });
};
