import { S3Client, PutBucketCorsCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: "auto",
  endpoint: "https://8e19481a16647679f6ab9703ef5e5189.r2.cloudflarestorage.com",
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
});

const command = new PutBucketCorsCommand({
  Bucket: "msevizag",
  CORSConfiguration: {
    CORSRules: [
      {
        AllowedHeaders: ["*"],
        AllowedMethods: ["GET", "PUT", "POST", "DELETE", "HEAD"],
        AllowedOrigins: ["*"],
        ExposeHeaders: [],
        MaxAgeSeconds: 3000,
      },
    ],
  },
});

async function setCors() {
  try {
    await s3Client.send(command);
    console.log("Successfully updated CORS policy for R2 bucket!");
  } catch (err) {
    console.error("Error setting CORS:", err);
  }
}

setCors();
