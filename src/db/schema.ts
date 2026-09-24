import {
  pgTable,
  uuid,
  varchar,
  text,
  numeric,
  jsonb,
  boolean,
  integer,
  timestamp,
  pgEnum,
  index,
  customType
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const stockStatusEnum = pgEnum('stock_status_enum', ['in_stock', 'sold_out', 'pre_order']);

// Custom type for tsvector 
const tsvector = customType<{ data: string }>({
  dataType() {
    return 'tsvector';
  },
});

export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  description: text('description'),
  price: numeric('price', { precision: 10, scale: 2 }).notNull().default('0.00'),
  
  r2FolderUrl: text('r2_folder_url').generatedAlwaysAs(
    (): any => sql`('https://your-r2-bucket-domain.com/products/' || id::text || '/')`
  ),
  
  specs: jsonb('specs').notNull().default(sql`'{}'::jsonb`),
  tags: text('tags').array().default(sql`'{}'`),
  
  isVisible: boolean('is_visible').notNull().default(true),
  stockStatus: stockStatusEnum('stock_status').notNull().default('in_stock'),
  stockQuantity: integer('stock_quantity').notNull().default(0),
  
  sku: varchar('sku', { length: 100 }).unique(),
  internalNotes: text('internal_notes'),
  
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),

  fts: tsvector('fts').generatedAlwaysAs((): any => sql`(
        setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(description, '')), 'B')
  )`)
}, (table) => [
  index('idx_products_slug').on(table.slug),
  index('idx_products_specs').using('gin', table.specs),
  index('idx_products_tags').using('gin', table.tags),
  index('idx_products_fts').using('gin', table.fts),
  index('idx_products_visibility').on(table.isVisible),
  index('idx_products_stock_status').on(table.stockStatus),
  index('idx_products_created_at').on(table.createdAt.desc()),
]);

// Exporting Types
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
