import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        console.log('Cron job triggered at:', new Date().toISOString());

        // Gọi API endpoint của chúng ta
        const baseUrl = process.env.VERCEL_URL
            ? `https://${process.env.VERCEL_URL}`
            : 'http://localhost:3000';

        const response = await fetch(`${baseUrl}/api/thala-monitor`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            const result = await response.json();
            console.log('Thala monitor API called successfully:', result);

            return NextResponse.json({
                success: true,
                message: 'Cronjob executed successfully',
                timestamp: new Date().toISOString(),
                result
            });
        } else {
            console.error('Failed to call Thala monitor API:', response.status);
            return NextResponse.json({
                success: false,
                message: 'Failed to execute cronjob',
                timestamp: new Date().toISOString()
            }, { status: 500 });
        }
    } catch (error) {
        console.error('Cronjob error:', error);
        return NextResponse.json({
            success: false,
            message: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    // Cũng hỗ trợ POST method
    return GET(request);
}
