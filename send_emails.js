import dotenv from 'dotenv';
import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import nodemailer from 'nodemailer';
import base64 from 'base-64';

dotenv.config();

// Initialize DynamoDB Client
const client = new DynamoDBClient({ region: 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(client);

// Function to read data from DynamoDB
const readDataFromDynamoDB = async () => {
  const command = new ScanCommand({
    TableName: 'MSL_Direct_Student_IN'
    
  });
  const response = await docClient.send(command);
  return response.Items;
};

// Function to send emails
const sendEmails = async (students) => {
  const senderAddress = 'citrineschools@gmail.com';
  const senderPass = 'swdzotleqcqufxpq';
  
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: senderAddress,
      pass: senderPass
    }
  });
  console.log("students",students)

  for (const student of students) {
    console.log("students",student, '${student.dynamokey}');
    const decodedKey = base64.decode('bG9rZXNo');
    
    const mailContent = `Dear Student, \n\n Here are the login credentials for online examination for recruitment at Meslova Systems Pvt Ltd. 
    \n\n URL : https://citrineschools.com/login/  \n User ID : ${student.user__username.user__username} \n 
    Password: ${decodedKey} \n\n Exam Date & Time : 03th July 2023 at 11:00 am`;

    const mailOptions = {
      from: senderAddress,
      to: "sreeshasanne@gmail.com",
      subject: 'Meslova Recruitment - Online Examination Credentials',
      text: mailContent,
      //html: `<html><head></head><body><p style="color: green; font-size:18px;font-weight:600;">All The Best!</p><p style="">Meslova Team</p></body></html>`
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`Email sent to ${student.user__email}`);
    } catch (error) {
      console.error(`Error sending email to ${student.user__email}:`, error);
    }
  }
};

export const handler = async (event) => {
  try {
    const students = await readDataFromDynamoDB();
    console.log("students",students)
    await sendEmails(students);
    console.log('Emails sent successfully');
  } catch (error) {
    console.error('Error:', error);
  }
};