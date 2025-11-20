import { NextResponse } from 'next/server';

const THALA_API_URL = 'https://app.thala.fi/api/liquidity-pool?pool-type=0xfec90c113a5093bde30a7927f608fb41d6f56e00d2f944242de6c75c1732503f';

interface ThalaPoolData {
    // Định nghĩa interface dựa trên response từ API
    poolType?: string;
    totalLiquidity?: string;
    volume24h?: string;
    apr?: string;
    data?: {
        price?: number;
        metadata?: {
            price?: number;
            [key: string]: unknown;
        };
        [key: string]: unknown;
    };
    [key: string]: unknown;
}

async function sendToDiscord(message: string) {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (!webhookUrl) {
        console.log('Discord webhook URL not configured');
        return;
    }

    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                content: message,
                username: 'Thala Monitor Bot',
            }),
        });

        if (response.ok) {
            console.log('Message sent to Discord successfully');
        } else {
            console.error('Failed to send message to Discord:', response.status);
        }
    } catch (error) {
        console.error('Error sending to Discord:', error);
    }
}

async function sendToTelegram(message: string) {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
        console.log('Telegram bot token or chat ID not configured');
        return;
    }

    try {
        const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: 'HTML',
            }),
        });

        if (response.ok) {
            console.log('Message sent to Telegram successfully');
        } else {
            console.error('Failed to send message to Telegram:', response.status);
        }
    } catch (error) {
        console.error('Error sending to Telegram:', error);
    }
}

async function fetchThalaData(): Promise<ThalaPoolData | null> {
    try {
        const response = await fetch(THALA_API_URL, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Thala-Monitor-Bot/1.0',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching Thala data:', error);
        return null;
    }
}

function shouldSendNotification(data: ThalaPoolData): boolean {
    // Kiểm tra nếu data.data.price <= 1.0002 hoặc >= 1.0006 thì bắn noti
    console.log('Price:', data?.data);
    const price = data?.data?.metadata?.price;

    if (price === undefined || price === null) {
        console.log('Price not found in data, skipping notification');
        return false;
    }

    // const shouldNotify = false;
    const shouldNotify = price <= 0.9990 || price >= 0.9994;


    if (shouldNotify) {
        console.log(`Price ${price} is within notification range (<= 1.0002 or >= 1.0006)`);
    } else {
        console.log(`Price ${price} is outside notification range, skipping notification`);
    }

    return shouldNotify;
}

function formatMessage(data: ThalaPoolData): string {

    // Tùy chỉnh format message dựa trên cấu trúc data từ API
    let message = "";

    // Thêm các thông tin quan trọng từ pool data
    if (data) {
        message += `📊 **Price Data:**\n`;
        message += `• Current Price: ${data.data?.metadata?.price || 'N/A'}\n`;


    } else {
        message += `❌ **Error:** Failed to fetch pool data`;
    }

    return message;
}

export async function POST() {
    try {
        console.log('Thala monitor API called at:', new Date().toISOString());

        // Fetch data từ Thala API
        const poolData = await fetchThalaData();

        if (poolData) {
            // Kiểm tra điều kiện price trước khi gửi notification
            if (shouldSendNotification(poolData)) {
                // Format message
                const message = formatMessage(poolData);

                // Gửi đến Discord và Telegram
                await Promise.all([
                    // sendToDiscord(message),
                    sendToTelegram(message)
                ]);

                return NextResponse.json({
                    success: true,
                    message: 'Data fetched and notifications sent successfully',
                    data: poolData,
                    timestamp: new Date().toISOString()
                });
            } else {
                // Price không thỏa mãn điều kiện, không gửi notification
                return NextResponse.json({
                    success: true,
                    message: 'Data fetched but price condition not met, no notifications sent',
                    data: poolData,
                    timestamp: new Date().toISOString()
                });
            }
        } else {
            const errorMessage = `❌ **Thala Monitor Error** - ${new Date().toISOString()}\n\nFailed to fetch pool data from Thala API`;

            await Promise.all([
                // sendToDiscord(errorMessage),
                sendToTelegram(errorMessage)
            ]);

            return NextResponse.json({
                success: false,
                message: 'Failed to fetch Thala data',
                timestamp: new Date().toISOString()
            }, { status: 500 });
        }
    } catch (error) {
        console.error('Error in thala-monitor API:', error);

        const errorMessage = `❌ **Thala Monitor Error** - ${new Date().toISOString()}\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}`;

        await Promise.all([
            // sendToDiscord(errorMessage),
            sendToTelegram(errorMessage)
        ]);

        return NextResponse.json({
            success: false,
            message: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}

// Thêm GET method để test
export async function GET() {
    return NextResponse.json({
        message: 'Thala Monitor API is running',
        timestamp: new Date().toISOString(),
        endpoints: {
            POST: '/api/thala-monitor - Trigger monitoring and send notifications',
            GET: '/api/thala-monitor - Get API status'
        }
    });
}
