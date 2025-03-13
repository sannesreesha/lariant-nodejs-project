const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
    let body;
    
    // ✅ Safely parse JSON
    try {
        body = event.body ? JSON.parse(event.body) : {};
    } catch (error) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "Invalid JSON format in request body", error: error.message })
        };
    }

    // ✅ Validate required fields
    if (!body.package_id || !body.student_ids || !Array.isArray(body.student_ids)) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "Invalid request data: 'package_id' and 'student_ids' (array) are required" })
        };
    }

    try {
        const packageId = body.package_id;
        const studentIds = body.student_ids;
        const purchaseDate = new Date().toISOString();

        const mappingPromises = studentIds.map(studentId => {
            const command = new PutCommand({
                TableName: "StudentPackageMapping",
                Item: {
                    id: `${studentId}-${packageId}`, // Unique composite key
                    package_id: packageId,
                    student_id: studentId,
                    purchase_date: purchaseDate,
                    number_of_tests_assigned: body.number_of_tests_assigned || 0
                },
            });
            return docClient.send(command);
        });

        await Promise.all(mappingPromises);

        return {
            statusCode: 201,
            body: JSON.stringify({ message: "Students mapped successfully!" }),
        };
    } catch (error) {
        console.error("Error saving mapping:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Error saving mapping", error: error}),
        };
    }
};
