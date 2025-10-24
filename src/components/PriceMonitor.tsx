'use client';

import { useEffect, useState } from 'react';

export default function PriceMonitor() {
    const [lastUpdate, setLastUpdate] = useState<string>('');
    const [isMonitoring, setIsMonitoring] = useState(false);

    const callMonitorAPI = async () => {
        try {
            const response = await fetch('/api/thala-monitor', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                setLastUpdate(new Date().toLocaleString());
                console.log('Monitor API called successfully');
            }
        } catch (error) {
            console.error('Failed to call monitor API:', error);
        }
    };

    useEffect(() => {
        if (!isMonitoring) return;

        // Call immediately
        callMonitorAPI();

        // Then call every 30 seconds
        const interval = setInterval(callMonitorAPI, 30000);

        return () => clearInterval(interval);
    }, [isMonitoring]);

    return (
        <div className="p-4 border rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Price Monitor</h2>
            <button
                onClick={() => setIsMonitoring(!isMonitoring)}
                className={`px-4 py-2 rounded ${isMonitoring
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-green-500 hover:bg-green-600'
                    } text-white`}
            >
                {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
            </button>
            {lastUpdate && (
                <p className="mt-2 text-sm text-gray-600">
                    Last update: {lastUpdate}
                </p>
            )}
        </div>
    );
}
