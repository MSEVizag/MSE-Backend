import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// S3 client will be instantiated inside the handlers

export async function POST(request: Request) {
  try {
    const { productId, filename, contentType } = await request.json();

    if (!productId || !filename || !contentType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const key = `products/${productId}/${filename}`;

    const s3Client = new S3Client({
      region: 'auto',
      endpoint: 'https://8e19481a16647679f6ab9703ef5e5189.r2.cloudflarestorage.com',
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
      },
    });

    const command = new PutObjectCommand({
      Bucket: 'msevizag',
      Key: key,
      ContentType: contentType,
    });

    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });
    const cdnUrl = `https://msecdn.switchspace.in/${key}`;

    return NextResponse.json({ success: true, presignedUrl, cdnUrl, key });
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
