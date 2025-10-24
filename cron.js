const { exec } = require('child_process');

// Cronjob chạy mỗi 10 giây
// Lưu ý: Vercel có giới hạn về tần suất cronjob, thường là tối thiểu 1 phút
// Để chạy mỗi 10 giây, bạn có thể sử dụng Vercel Edge Functions hoặc external cron service

module.exports = {
    async handler(req, res) {
        try {
            console.log('Cronjob started at:', new Date().toISOString());

            // Gọi API endpoint của chúng ta
            const response = await fetch(`${process.env.VERCEL_URL || 'http://localhost:3000'}/api/thala-monitor`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                console.log('Thala monitor API called successfully');
                res.status(200).json({ success: true, message: 'Cronjob executed successfully' });
            } else {
                console.error('Failed to call Thala monitor API:', response.status);
                res.status(500).json({ success: false, message: 'Failed to execute cronjob' });
            }
        } catch (error) {
            console.error('Cronjob error:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    }
};
