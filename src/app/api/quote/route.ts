import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.name || !data.email || !data.phone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newRequest = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ...data
    };

    // Construct the absolute path to the data file
    const dataFilePath = path.join(process.cwd(), 'public', 'data', 'estimates-req.json');
    
    // Read existing data
    let currentData = [];
    if (fs.existsSync(dataFilePath)) {
      const fileData = fs.readFileSync(dataFilePath, 'utf-8');
      try {
        currentData = JSON.parse(fileData);
      } catch (e) {
        currentData = [];
      }
    }

    // Append the new request
    currentData.push(newRequest);

    // Write it back to the file
    fs.writeFileSync(dataFilePath, JSON.stringify(currentData, null, 2));

    return NextResponse.json({ success: true, message: 'Quote request saved successfully.', id: newRequest.id });
  } catch (error) {
    console.error('Error saving quote request:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
