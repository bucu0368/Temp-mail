const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 5000;

// Middleware to parse JSON
app.use(express.json());

// Serve static files
app.use(express.static(__dirname));

// API endpoint to create email
app.get('/email-create', async (req, res) => {
  try {
    const API_BASE = 'https://api.mail.tm';
    
    // Get available domain
    const domainResponse = await fetch(`${API_BASE}/domains`);
    const domainData = await domainResponse.json();
    const domain = domainData['hydra:member'][0].domain;
    
    // Generate random username and password
    const username = 'temp' + Math.random().toString(36).substring(2, 10);
    const gmail = `${username}@${domain}`;
    const password = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12);
    
    // Create account
    const createResponse = await fetch(`${API_BASE}/accounts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        address: gmail,
        password: password
      })
    });
    
    if (!createResponse.ok) {
      throw new Error('Failed to create account');
    }
    
    // Login to get token
    const loginResponse = await fetch(`${API_BASE}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        address: gmail,
        password: password
      })
    });
    
    if (!loginResponse.ok) {
      throw new Error('Failed to login');
    }
    
    const loginData = await loginResponse.json();
    
    res.json({
      Gmail: gmail,
      password: password,
      token: loginData.token
    });
    
  } catch (error) {
    console.error('Error creating email:', error);
    res.status(500).json({ error: 'Failed to create email account' });
  }
});

// API endpoint to get inbox
app.get('/email-inbox', async (req, res) => {
  try {
    const gmail = req.query.gmail;
    const token = req.query.token;
    
    if (!gmail || !token) {
      return res.status(400).json({ error: 'Gmail and token are required' });
    }
    
    const API_BASE = 'https://api.mail.tm';
    
    const response = await fetch(`${API_BASE}/messages`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to get messages');
    }
    
    const data = await response.json();
    
    res.json({
      gmail: gmail,
      total: data['hydra:totalItems'],
      messages: data['hydra:member']
    });
    
  } catch (error) {
    console.error('Error getting inbox:', error);
    res.status(500).json({ error: 'Failed to get inbox' });
  }
});

// Serve index.html for all other routes (must be last)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on http://0.0.0.0:${PORT}`);
  console.log(`📧 Temp Email application is ready!`);
});
