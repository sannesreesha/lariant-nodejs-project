const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, ScanCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
    try {
        const packagesCommand = new ScanCommand({ TableName: "PackagesTable" });
        const studentsCommand = new ScanCommand({ TableName: "StudentsTable" });

        const packages = await docClient.send(packagesCommand);
        const students = await docClient.send(studentsCommand);

        return {
            statusCode: 200,
            body: JSON.stringify({
                packages: packages.Items || [],
                students: students.Items || [],
            }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Error fetching data", error }),
        };
    }
};



