# Thala Monitor Bot

Bot theo dõi và gửi thông báo về Discord/Telegram khi có thay đổi từ Thala API.

## Tính năng

- 🔄 Cronjob chạy mỗi 1 phút
- 📊 Gọi API Thala để lấy dữ liệu pool
- 💬 Gửi thông báo đến Discord và Telegram
- ⚡ Chạy trên Vercel với Edge Functions

## Cài đặt

### 1. Clone repository và cài đặt dependencies

```bash
npm install
```

### 2. Cấu hình Environment Variables

Copy file `env.example` thành `.env.local` và điền thông tin:

```bash
cp env.example .env.local
```

Các biến môi trường cần thiết:

- `DISCORD_WEBHOOK_URL`: Webhook URL từ Discord
- `TELEGRAM_BOT_TOKEN`: Token bot từ @BotFather
- `TELEGRAM_CHAT_ID`: Chat ID để gửi tin nhắn

### 3. Cấu hình Discord Webhook

1. Vào Discord Server Settings > Integrations > Webhooks
2. Tạo webhook mới
3. Copy webhook URL và paste vào `DISCORD_WEBHOOK_URL`

### 4. Cấu hình Telegram Bot

1. Chat với @BotFather trên Telegram
2. Gửi lệnh `/newbot` và làm theo hướng dẫn
3. Copy bot token vào `TELEGRAM_BOT_TOKEN`
4. Để lấy Chat ID:
   - Gửi tin nhắn cho bot
   - Truy cập: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
   - Tìm `chat.id` trong response

### 5. Deploy lên Vercel

```bash
# Cài đặt Vercel CLI
npm i -g vercel

# Deploy
vercel

# Cấu hình environment variables trên Vercel dashboard
```

## API Endpoints

### `/api/thala-monitor`
- **POST**: Trigger monitoring và gửi thông báo
- **GET**: Kiểm tra trạng thái API

### `/api/cron`
- **GET/POST**: Endpoint cho cronjob

## Cronjob Configuration

Cronjob được cấu hình trong `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron",
      "schedule": "* * * * *"
    }
  ]
}
```

**Schedule**: `* * * * *` = chạy mỗi phút

## Testing

### Test API endpoint

```bash
curl -X POST http://localhost:3000/api/thala-monitor
```

### Test cronjob

```bash
curl http://localhost:3000/api/cron
```

## Cấu trúc Project

```
src/
├── app/
│   ├── api/
│   │   ├── cron/
│   │   │   └── route.ts          # Cronjob endpoint
│   │   └── thala-monitor/
│   │       └── route.ts          # Main monitoring API
│   └── page.tsx                  # Homepage
├── vercel.json                   # Vercel configuration
├── cron.js                       # Legacy cron file
└── env.example                   # Environment variables template
```

## Troubleshooting

### Lỗi thường gặp

1. **Discord webhook không hoạt động**
   - Kiểm tra webhook URL
   - Đảm bảo bot có quyền gửi tin nhắn

2. **Telegram bot không gửi được tin nhắn**
   - Kiểm tra bot token
   - Đảm bảo chat ID đúng
   - Bot phải được start trước

3. **Cronjob không chạy**
   - Kiểm tra cấu hình trong vercel.json
   - Xem logs trên Vercel dashboard
   - Đảm bảo app đã được deploy thành công

### Debug

Kiểm tra logs trên Vercel dashboard hoặc local:

```bash
npm run dev
# Xem logs trong terminal
```

## Customization

### Thay đổi format tin nhắn

Chỉnh sửa function `formatMessage()` trong `src/app/api/thala-monitor/route.ts`

### Thay đổi tần suất cronjob

Chỉnh sửa `schedule` trong `vercel.json`

### Thêm logic phát hiện thay đổi

Thêm logic so sánh dữ liệu cũ và mới trong API endpoint

## License

MIT