import { NextResponse } from 'next/server';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';

function getS3Client() {
  return new S3Client({
    region: 'auto',
    endpoint: 'https://8e19481a16647679f6ab9703ef5e5189.r2.cloudflarestorage.com',
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
    },
  });
}

export async function GET() {
  try {
    const s3Client = getS3Client();
    const command = new GetObjectCommand({
      Bucket: 'msevizag',
      Key: 'variables.json'
    });

    try {
      const response = await s3Client.send(command);
      const str = await response.Body?.transformToString();
      if (str) {
        return NextResponse.json(JSON.parse(str));
      }
    } catch (err: any) {
      if (err.name === 'NoSuchKey') {
        return NextResponse.json({ brands: [] });
      }
      throw err;
    }
    
    return NextResponse.json({ brands: [] });
  } catch (error) {
    console.error('Error fetching variables:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { brand } = await request.json();
    if (!brand || typeof brand !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid brand' }, { status: 400 });
    }

    const s3Client = getS3Client();
    
    // Fetch existing variables
    let variables = { brands: [] as string[] };
    try {
      const getCommand = new GetObjectCommand({ Bucket: 'msevizag', Key: 'variables.json' });
      const response = await s3Client.send(getCommand);
      const str = await response.Body?.transformToString();
      if (str) {
        variables = JSON.parse(str);
      }
    } catch (err: any) {
      if (err.name !== 'NoSuchKey') throw err;
    }

    if (!variables.brands) {
      variables.brands = [];
    }

    if (!variables.brands.includes(brand)) {
      variables.brands.push(brand);
    }

    // Save updated variables
    const putCommand = new PutObjectCommand({
      Bucket: 'msevizag',
      Key: 'variables.json',
      Body: JSON.stringify(variables, null, 2),
      ContentType: 'application/json'
    });
    
    await s3Client.send(putCommand);

    return NextResponse.json({ success: true, variables });
  } catch (error) {
    console.error('Error updating variables:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
