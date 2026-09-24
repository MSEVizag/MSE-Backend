import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    await sql`SELECT 1;`;
    return NextResponse.json({ status: 'awake' }, { status: 200 });
  } catch (error) {
    console.error('Neon DB Ping failed:', error);
    return NextResponse.json({ status: 'error' }, { status: 500 });
  }
}
