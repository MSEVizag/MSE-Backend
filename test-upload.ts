import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: "auto",
  endpoint: "https://8e19481a16647679f6ab9703ef5e5189.r2.cloudflarestorage.com",
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
});

async function testPut() {
  try {
    const data = await s3Client.send(
      new PutObjectCommand({
        Bucket: "msevizag",
        Key: "test.txt",
        Body: "hello world",
      })
    );
    console.log("Success:", data);
  } catch (err) {
    console.error("Error uploading:", err);
  }
}

testPut();
