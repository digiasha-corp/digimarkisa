import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { url, payload } = await request.json();
    if (!url) {
      return NextResponse.json({ success: false, error: 'Web App URL missing' }, { status: 400 });
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to proxy request to Google Sheets' },
      { status: 500 }
    );
  }
}
