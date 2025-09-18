# Explanation of Lambda Code

This Lambda function connects AWS API Gateway with DynamoDB to serve dictionary terms.

## Main Steps
1. **Import AWS SDK v3 modules** – To interact with DynamoDB.
2. **Initialize DynamoDB Client** – Using `DynamoDBDocumentClient` for easier JSON handling.
3. **Read Input Term** – Extract `term` from query string, path, or body.
4. **Validate Input** – If no term is provided, return HTTP 400.
5. **Normalize Input** – Convert term to lowercase for consistent lookup.
6. **Fetch From DynamoDB** – Use `GetCommand` to retrieve the item by key.
7. **Return Response**:
   - If found → return term + definition.
   - If not found → return HTTP 404.
   - If error → return HTTP 500.

This allows the Cloud Dictionary to provide API-driven access to stored terms.






1. Import AWS SDK v3 Modules
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand } = require("@aws-sdk/lib-dynamodb");


DynamoDBClient → low-level DynamoDB client.

DynamoDBDocumentClient → wrapper that makes it easier to use normal JSON objects (instead of DynamoDB’s { S: "string" } format).

GetCommand → operation for fetching a single item from DynamoDB.

👉 AWS SDK v3 splits services into smaller packages, so you only import what you need.

2. Create DynamoDB Client
const client = new DynamoDBClient();
const dynamo = DynamoDBDocumentClient.from(client);


client = raw DynamoDB client.

dynamo = high-level client for easy JSON.

dynamo.send(new GetCommand(...)) will be used to run queries.

3. Define Table Name
const TABLE = process.env.DYNAMODB_TABLE || "CloudDictionary";


Uses environment variable DYNAMODB_TABLE if set.

Defaults to "CloudDictionary" otherwise.

Makes code reusable across environments (dev/prod).

4. Lambda Handler
exports.handler = async (event) => {
  console.log("Incoming event:", JSON.stringify(event));


Entry point of the Lambda function.

event comes from API Gateway → contains query params, path params, or body.

Logs the incoming request for debugging.

5. Extract Term from Request
const term =
  (event.queryStringParameters && event.queryStringParameters.term) ||
  (event.pathParameters && event.pathParameters.term) ||
  (event.body ? (JSON.parse(event.body).term || null) : null);


Checks 3 possible sources:

Query string → /define?term=lambda

Path parameter → /define/lambda

Request body → { "term": "lambda" }

👉 Picks whichever is available.

6. Handle Missing Input
if (!term) {
  return {
    statusCode: 400,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ error: "Missing required query parameter: term" }),
  };
}


If no word provided → return HTTP 400 Bad Request.

Always responds in JSON.

7. Normalize the Input
const normalized = term.toLowerCase();


Converts input to lowercase → "Lambda", "lambda", "LAMBDA" → all treated the same.

Ensures case-insensitive lookups.

8. Query DynamoDB
const result = await dynamo.send(
  new GetCommand({
    TableName: TABLE,
    Key: { term: normalized },
  })
);


Uses GetCommand to fetch one item.

DynamoDB table must have term as the Partition Key.

Example item:

{
  "term": "lambda",
  "definition": "A serverless compute service on AWS."
}

9. Handle "Not Found"
if (!result.Item) {
  return {
    statusCode: 404,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ error: `Term '${term}' not found` }),
  };
}


If DynamoDB returns nothing → return HTTP 404 Not Found.

Provides clear error message.

10. Success Response
return {
  statusCode: 200,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*", // allow frontend calls
  },
  body: JSON.stringify({
    term: result.Item.term,
    definition: result.Item.definition,
  }),
};


Returns HTTP 200 OK with term + definition.

Includes CORS header so React frontend (Amplify, localhost, etc.) can access it.

11. Error Handling
} catch (err) {
  console.error("DynamoDB error:", err);
  return {
    statusCode: 500,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ error: "Internal Server Error" }),
  };
}


Logs error to CloudWatch.

Returns HTTP 500 Internal Server Error if something goes wrong.




✅ In Short:

Input comes from query/path/body.

Normalized to lowercase.

Looked up in DynamoDB.

Returns JSON with term + definition.

Handles errors gracefully (400, 404, 500).





Q1: How can I extend this Lambda to return a list of all dictionary terms instead of just one?
A1: You’d use ScanCommand or QueryCommand instead of GetCommand. ScanCommand retrieves all items, but it’s less efficient for large tables. A dedicated endpoint /terms could handle that and return a list of terms with pagination.

Q2: What if I want to allow partial search (e.g., typing “lam” finds “lambda”)?
A2: DynamoDB doesn’t support direct substring search. You’d need either:

A secondary index with prefixes,

Store terms in Elasticsearch/OpenSearch for full-text search, or

Pre-compute searchable tokens.

Q3: How can I secure this Lambda so only my front-end app can call it?
A3: Add API Gateway authentication (like Cognito or API keys). You could also restrict CORS to specific domains (instead of "*"). For production, using IAM roles or Cognito User Pools is best practice.