import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import XLSX from "xlsx";

const region = "us-east-1";

const s3Client = new S3Client({region});
const dynamoDBClient = new DynamoDBClient({region});
const docClient = DynamoDBDocumentClient.from(dynamoDBClient);

export const handler = async (event) => {
  const bucket = "registration-new";
  const key = 'student_data.xlsx';
  const tableName = 'Registration';

  try {
    // Get the XLSX file from S3
    const data = await s3Client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
    const body = await streamToBuffer(data.Body);
    
    // Parse the XLSX file
    const records = parseXLSX(body);
    
    // Insert records into DynamoDB
    for (const record of records) {
      const params = {
        TableName: tableName,
        Item: record,
      };
      await docClient.send(new PutCommand(params));
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'XLSX file processed successfully' }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error processing XLSX file' }),
    };
  }
};

const streamToBuffer = async (stream) => {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
};

const parseXLSX = (data) => {
  const workbook = XLSX.read(data, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(sheet);
};

handler({}).then(console.log).catch(console.error);