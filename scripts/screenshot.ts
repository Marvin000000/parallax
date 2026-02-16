const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium-browser', // Force system chrome
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox'] 
  });
  const page = await browser.newPage();
  
  // Set larger viewport to see everything
  await page.setViewport({ width: 1280, height: 800 });
  
  console.log('Visiting page...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  
  console.log('Taking screenshot...');
  await page.screenshot({ path: 'public/feed.png', fullPage: true });
  
  await browser.close();
  console.log('Screenshot saved to public/feed.png');
})();
