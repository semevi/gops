import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file located in the same directory
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors() as any);
app.use(express.json() as any);

// DAA API Constants
const SNAPSHOT_URL = 'https://api.daa.ie/dub/aops/flightdata/operational/v1/carrier/EI,BA,IB,VY,I2,AA,T2';
const UPDATES_URL = 'https://api.daa.ie/dub/aops/flightdata/operational/v1/updates';

app.get('/api/flights', async (req, res) => {
  try {
    const appId = process.env.DAA_APP_ID;
    const appKey = process.env.DAA_APP_KEY;

    if (!appId || !appKey) {
      console.error('DAA_APP_ID or DAA_APP_KEY not set in .env');
      return res.status(500).json({ error: 'Server configuration error: Missing API credentials' });
    }

    const { latestModTime, date, direction } = req.query;
    let url = SNAPSHOT_URL;
    const params = new URLSearchParams();

    // Logic to switch between snapshot and updates
    if (latestModTime) {
        url = UPDATES_URL;
        params.append('latestModTime', latestModTime as string);
    } else {
        // Calculate day offsets for snapshot based on selected date
        // 0 = Today, 1 = Tomorrow, -1 = Yesterday
        let startDay = "0";
        let endDay = "1";

        if (date) {
            const [y, m, d] = (date as string).split('-').map(Number);
            const target = new Date(y, m - 1, d);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const diffTime = target.getTime() - today.getTime();
            const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
            
            startDay = String(diffDays);
            endDay = String(diffDays + 1);
        }
        params.append('startDay', startDay);
        params.append('endDay', endDay);

        if (direction) {
            params.append('direction', direction as string);
        }
    }

    const fetchUrl = `${url}?${params.toString()}`;
    console.log(`Proxying request to DAA API: ${fetchUrl}`);

    // Fetch data using node's fetch (Node 18+)
    const response = await fetch(fetchUrl, {
        headers: {
            "app_id": appId,
            "app_key": appKey,
            "Accept": "application/json"
        }
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error(`Upstream API Error: ${response.status} - ${errorText}`);
        return res.status(response.status).send(errorText);
    }

    const data = await response.json();
    res.json(data);

  } catch (error) {
    console.error('Backend server error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Export app for Vercel Serverless Function
export default app;

// Start server only if not running in Vercel (Vercel manages the server)
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Backend server is running on port ${PORT}`);
    });
}