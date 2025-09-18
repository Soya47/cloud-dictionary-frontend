// index.js (AWS SDK v3)
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient();
const dynamo = DynamoDBDocumentClient.from(client);

const TABLE = process.env.DYNAMODB_TABLE || "CloudDictionary";

exports.handler = async (event) => {
  console.log("Incoming event:", JSON.stringify(event));

  const term =
    (event.queryStringParameters && event.queryStringParameters.term) ||
    (event.pathParameters && event.pathParameters.term) ||
    (event.body ? (JSON.parse(event.body).term || null) : null);

  if (!term) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Missing required query parameter: term" }),
    };
  }

  const normalized = term.toLowerCase();

  try {
    const result = await dynamo.send(
      new GetCommand({
        TableName: TABLE,
        Key: { term: normalized },
      })
    );

    if (!result.Item) {
      return {
        statusCode: 404,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: `Term '${term}' not found` }),
      };
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        term: result.Item.term,
        definition: result.Item.definition,
      }),
    };
  } catch (err) {
    console.error("DynamoDB error:", err);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};
