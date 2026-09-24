import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: 'auto',
  endpoint: 'https://6f97938ae67d40dcb6b8b3b8e0e5e7e8.r2.cloudflarestorage.com',
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
});

export async function POST(request: Request) {
  try {
    const newProduct = await request.json();
    
    // Validate required fields
    if (!newProduct.title || !newProduct.category || !newProduct.image || !newProduct.description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const dataFilePath = path.join(process.cwd(), 'public', 'data', 'catalog.json');
    
    // Read existing catalog
    let currentCatalog = [];
    if (fs.existsSync(dataFilePath)) {
      const fileData = fs.readFileSync(dataFilePath, 'utf-8');
      try {
        currentCatalog = JSON.parse(fileData);
      } catch (e) {
        currentCatalog = [];
      }
    }

    // Generate a unique ID
    const maxId = currentCatalog.reduce((max: number, p: any) => {
      const idNum = parseInt(p.id, 10);
      return !isNaN(idNum) && idNum > max ? idNum : max;
    }, 0);
    newProduct.id = (maxId + 1).toString();

    // R2 Upload Logic
    if (newProduct.image && newProduct.image.startsWith('data:image/') && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY) {
      // 1. Decode base64 image
      const mimeType = newProduct.image.substring(
        newProduct.image.indexOf(':') + 1,
        newProduct.image.indexOf(';')
      );
      const extension = mimeType.split('/')[1] || 'jpg';
      const base64Data = newProduct.image.replace(/^data:image\/\w+;base64,/, '');
      const imageBuffer = Buffer.from(base64Data, 'base64');
      
      const imageKey = `${newProduct.id}/image.${extension}`;
      const specKey = `${newProduct.id}/spec.json`;

      // 2. Upload Image to R2
      await s3Client.send(new PutObjectCommand({
        Bucket: 'msevizag',
        Key: imageKey,
        Body: imageBuffer,
        ContentType: mimeType,
      }));

      // 3. Upload spec.json to R2
      await s3Client.send(new PutObjectCommand({
        Bucket: 'msevizag',
        Key: specKey,
        Body: JSON.stringify(newProduct.specs || [], null, 2),
        ContentType: 'application/json',
      }));

      // 4. Set public CDN URL
      newProduct.image = `https://msecdn.switchspace.in/${imageKey}`;
    }

    // Append the new product
    currentCatalog.push(newProduct);

    // Write it back to the file
    const dataDirPath = path.dirname(dataFilePath);
    if (!fs.existsSync(dataDirPath)) {
      fs.mkdirSync(dataDirPath, { recursive: true });
    }
    fs.writeFileSync(dataFilePath, JSON.stringify(currentCatalog, null, 2));

    return NextResponse.json({ success: true, product: newProduct });
  } catch (error) {
    console.error('Error adding product:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    
    if (!id) {
      return NextResponse.json({ error: 'Missing product ID' }, { status: 400 });
    }

    const dataFilePath = path.join(process.cwd(), 'public', 'data', 'catalog.json');
    
    if (!fs.existsSync(dataFilePath)) {
      return NextResponse.json({ error: 'Catalog not found' }, { status: 404 });
    }

    const fileData = fs.readFileSync(dataFilePath, 'utf-8');
    let currentCatalog = JSON.parse(fileData);

    const initialLength = currentCatalog.length;
    currentCatalog = currentCatalog.filter((p: any) => p.id !== id);

    if (currentCatalog.length === initialLength) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Write updated catalog back to the file
    fs.writeFileSync(dataFilePath, JSON.stringify(currentCatalog, null, 2));

    return NextResponse.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
