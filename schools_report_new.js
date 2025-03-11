import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
export const handler = async () => {
const command = new ScanCommand({
TableName: "",
 });
const response = await docClient.send(command);
for (const test of response.Items) {
console.log(`${test.skey} - (${test.std_name}`);
 }
return response;
};