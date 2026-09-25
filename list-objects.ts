import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: "auto",
  endpoint: "https://8e19481a16647679f6ab9703ef5e5189.r2.cloudflarestorage.com",
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
});

async function listObjects() {
  try {
    const command = new ListObjectsV2Command({
      Bucket: "msevizag",
      Prefix: "products/b1687147-c78f-4966-861b-c3257cb9ca8e/"
    });
    const response = await s3Client.send(command);
    console.log(response.Contents);
  } catch (error) {
    console.error("Error:", error);
  }
}

listObjects();
