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

// Default FAQs to seed if the file doesn't exist
const DEFAULT_FAQS = [
  {
    question: "What is your return policy?",
    answer: "We offer a 7-day return policy for unused products in their original packaging. Please contact our support team to initiate a return."
  },
  {
    question: "Do you provide installation services?",
    answer: "Yes, we provide professional installation services for an additional fee depending on your location and the product purchased."
  },
  {
    question: "How long does shipping take?",
    answer: "Standard shipping typically takes 3-5 business days. Expedited shipping options are available at checkout."
  },
  {
    question: "Are these products covered by a warranty?",
    answer: "All our heavy machinery and equipment come with a standard 1-year manufacturer warranty covering parts and labor."
  }
];

export async function GET() {
  try {
    const s3Client = getS3Client();
    const command = new GetObjectCommand({
      Bucket: 'msevizag',
      Key: 'FAQ.json'
    });

    try {
      const response = await s3Client.send(command);
      const str = await response.Body?.transformToString();
      if (str) {
        return NextResponse.json(JSON.parse(str));
      }
    } catch (err: any) {
      if (err.name === 'NoSuchKey') {
        // Automatically seed and return default FAQs if file doesn't exist
        const putCommand = new PutObjectCommand({
          Bucket: 'msevizag',
          Key: 'FAQ.json',
          Body: JSON.stringify(DEFAULT_FAQS, null, 2),
          ContentType: 'application/json'
        });
        await s3Client.send(putCommand);
        return NextResponse.json(DEFAULT_FAQS);
      }
      throw err;
    }
    
    return NextResponse.json(DEFAULT_FAQS);
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const faqs = await request.json();
    if (!Array.isArray(faqs)) {
      return NextResponse.json({ error: 'Invalid data format. Expected an array of FAQs.' }, { status: 400 });
    }

    const s3Client = getS3Client();
    
    const putCommand = new PutObjectCommand({
      Bucket: 'msevizag',
      Key: 'FAQ.json',
      Body: JSON.stringify(faqs, null, 2),
      ContentType: 'application/json'
    });
    
    await s3Client.send(putCommand);

    return NextResponse.json({ success: true, faqs });
  } catch (error) {
    console.error('Error updating FAQs:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
