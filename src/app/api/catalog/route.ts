import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { db } from '@/lib/db';
import { products } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import crypto from 'crypto';

const s3Client = new S3Client({
  region: 'auto',
  endpoint: 'https://6f97938ae67d40dcb6b8b3b8e0e5e7e8.r2.cloudflarestorage.com',
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
});

export async function GET() {
  try {
    const allProducts = await db.select().from(products).orderBy(desc(products.createdAt));
    
    // Map database models to the JSON structure expected by the frontend
    const mappedProducts = allProducts.map(p => {
      const specsJson: any = p.specs || {};
      return {
        id: p.id,
        title: p.name,
        slug: p.slug,
        category: p.category,
        description: p.description,
        image: specsJson.image || '',
        thumbnails: specsJson.thumbnails || [],
        videoUrl: specsJson.videoUrl || '',
        badges: specsJson.badges || [],
        pricingTiers: specsJson.pricingTiers || [],
        hideExactPrices: specsJson.hideExactPrices || false,
        testimonials: specsJson.testimonials || [],
        documents: specsJson.documents || [],
        contactConfig: specsJson.contactConfig || {},
        features: specsJson.features || [],
        specs: specsJson.extendedSpecs || [],
        tag: p.tags?.[0] || '',
        moq: p.moq,
        visibilityStatus: p.visibilityStatus,
        stockStatus: p.stockStatus,
      };
    });

    return NextResponse.json({ success: true, catalog: mappedProducts });
  } catch (error) {
    console.error('Error fetching catalog:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const newProduct = await request.json();
    
    if (!newProduct.title || !newProduct.category || !newProduct.image || !newProduct.description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const productId = newProduct.id || crypto.randomUUID();
    const slug = newProduct.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + productId.substring(0, 8);
    let imageUrl = newProduct.image;

    const specsJson = {
      image: imageUrl,
      thumbnails: newProduct.thumbnails || [],
      videoUrl: newProduct.videoUrl || '',
      badges: newProduct.badges || [],
      pricingTiers: newProduct.pricingTiers || [],
      hideExactPrices: newProduct.hideExactPrices || false,
      testimonials: newProduct.testimonials || [],
      documents: newProduct.documents || [],
      contactConfig: newProduct.contactConfig || {},
      features: newProduct.features || [],
      extendedSpecs: newProduct.extendedSpecs || newProduct.specs || [] 
    };

    if (process.env.R2_ACCESS_KEY_ID) {
      const infoKey = `products/${productId}/info.json`;
      const productDetails = {
        ...newProduct,
        id: productId,
        image: imageUrl
      };
      
      await s3Client.send(new PutObjectCommand({
        Bucket: 'msevizag',
        Key: infoKey,
        Body: JSON.stringify(productDetails, null, 2),
        ContentType: 'application/json',
      }));
    }

    let stockStatus: "in_stock" | "sold_out" | "pre_order" = "in_stock";
    if (newProduct.stockStatus && typeof newProduct.stockStatus === 'string') {
        const s = newProduct.stockStatus.toLowerCase();
        if (s.includes('order')) stockStatus = 'pre_order';
        if (s.includes('out')) stockStatus = 'sold_out';
    }

    const [insertedProduct] = await db.insert(products).values({
      id: productId,
      name: newProduct.title,
      slug: slug,
      category: newProduct.category,
      description: newProduct.description,
      price: newProduct.pricingTiers?.[0]?.price?.toString() || '0.00',
      specs: specsJson,
      tags: newProduct.tag ? [newProduct.tag] : [],
      moq: newProduct.moq || 1,
      visibilityStatus: newProduct.visibilityStatus || 'published',
      stockStatus: stockStatus,
      stockQuantity: 100
    }).returning();

    const responseProduct = {
      ...newProduct,
      id: insertedProduct.id,
      image: imageUrl,
    };

    return NextResponse.json({ success: true, product: responseProduct });
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

    const deleted = await db.delete(products).where(eq(products.id, id)).returning();
    
    if (deleted.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
