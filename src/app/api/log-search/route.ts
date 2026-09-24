import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    if (!data.query || data.query.trim() === '') {
      return NextResponse.json({ error: 'Query is empty' }, { status: 400 });
    }

    const logEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      query: data.query.trim(),
    };

    const dataFilePath = path.join(process.cwd(), 'public', 'data', 'search-logs.json');
    
    let currentLogs = [];
    if (fs.existsSync(dataFilePath)) {
      const fileData = fs.readFileSync(dataFilePath, 'utf-8');
      try {
        currentLogs = JSON.parse(fileData);
      } catch (e) {
        currentLogs = [];
      }
    }

    currentLogs.push(logEntry);

    fs.writeFileSync(dataFilePath, JSON.stringify(currentLogs, null, 2));

    return NextResponse.json({ success: true, logged: logEntry });
  } catch (error) {
    console.error('Error logging search query:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
