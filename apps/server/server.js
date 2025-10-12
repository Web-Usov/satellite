require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3001;
const N2YO_API_KEY = process.env.N2YO_API_KEY;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    apiKeyConfigured: !!N2YO_API_KEY 
  });
});

app.get('/api/satellite/*', async (req, res) => {
  try {
    if (!N2YO_API_KEY) {
      return res.status(500).json({ 
        error: 'API key not configured',
        message: 'Please set N2YO_API_KEY environment variable' 
      });
    }

    const path = req.path.replace('/api/satellite', '');
    const url = `https://api.n2yo.com/rest/v1/satellite${path}`;
    
    console.log(`[${new Date().toISOString()}] Proxying request to: ${url}`);

    const response = await axios.get(url, {
      params: { 
        apiKey: N2YO_API_KEY,
        ...req.query 
      },
      timeout: 10000,
    });

    res.json(response.data);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Proxy error:`, error.message);

    if (error.response) {
      res.status(error.response.status).json({
        error: 'N2YO API error',
        message: error.response.data?.error || error.message,
        statusCode: error.response.status,
      });
    } else if (error.request) {
      res.status(503).json({
        error: 'Service unavailable',
        message: 'Could not reach N2YO API. Check your internet connection.',
      });
    } else {
      res.status(500).json({
        error: 'Internal server error',
        message: error.message,
      });
    }
  }
});

app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not found',
    message: `Route ${req.path} not found` 
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Proxy server running on port ${PORT}`);
  console.log(`✅ API Key configured: ${!!N2YO_API_KEY}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
});


