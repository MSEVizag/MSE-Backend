import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { db } from './src/lib/db';
import { products } from './src/db/schema';
import { desc } from 'drizzle-orm';

async function syncCatalogToR2() {
  if (!process.env.R2_ACCESS_KEY_ID) return;
  
  try {
    const allProducts = await db.select().from(products).orderBy(desc(products.createdAt));
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
        extendedSpecs: specsJson.extendedSpecs || [],
        tag: p.tags?.[0] || '',
        moq: p.moq,
        visibilityStatus: p.visibilityStatus,
        stockStatus: p.stockStatus,
      };
    });

    const s3Client = new S3Client({
      region: 'auto',
      endpoint: 'https://8e19481a16647679f6ab9703ef5e5189.r2.cloudflarestorage.com',
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
      },
    });

    await s3Client.send(new PutObjectCommand({
      Bucket: 'msevizag',
      Key: 'catalog.json',
      Body: JSON.stringify({ catalog: mappedProducts }, null, 2),
      ContentType: 'application/json',
    }));
    console.log('Successfully synced catalog.json to R2');
  } catch (err) {
    console.error('Error syncing catalog.json to R2:', err);
  }
}

syncCatalogToR2();
