require('dotenv').config();
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function scrapeBBVA() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  try {
    console.log('🌐 Abriendo BBVA...');
    await page.goto('https://www.bbva.es', { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(2000);

    // Aceptar cookies
    try { await page.click('#onetrust-accept-btn-handler', { timeout: 3000 }); await sleep(800); } catch {}

    // Click en Acceso
    await page.evaluate(() => {
      const el = [...document.querySelectorAll('a,button')].find(e => e.textContent.trim() === 'Acceso');
      if (el) el.click();
    });
    await sleep(3000);
    await page.screenshot({ path: 'step1-login.png' });

    // Encontrar el iframe del login
    const loginFrameUrl = 'https://www.bbva.es/nimbus/signin.html';
    const loginFrame = page.frames().find(f => f.url().includes('signin.html'));
    if (!loginFrame) throw new Error('No se encontró el iframe de login');
    console.log('✅ Iframe de login encontrado:', loginFrame.url());

    // Rellenar DNI
    await loginFrame.waitForSelector('#input-user', { timeout: 8000 });
    await loginFrame.click('#input-user');
    await loginFrame.type('#input-user', process.env.BBVA_DNI, { delay: 80 });
    console.log('👤 DNI introducido');
    await sleep(400);

    // Rellenar contraseña
    await loginFrame.click('#input-password');
    await loginFrame.type('#input-password', process.env.BBVA_PASSWORD, { delay: 80 });
    console.log('🔒 Contraseña introducida');
    await sleep(400);
    await page.screenshot({ path: 'step2-filled.png' });

    // Click en Entrar — BBVA usa web component <haunted-button data-testid="login-form-submit">
    await loginFrame.waitForSelector('[data-testid="login-form-submit"]', { timeout: 5000 });
    await loginFrame.click('[data-testid="login-form-submit"]');
    console.log('🚀 Submit enviado');

    // Esperar navegación al dashboard
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {});
    await sleep(5000);
    await page.screenshot({ path: 'step3-dashboard.png' });
    console.log('📸 step3-dashboard.png');

    const bodyText = await page.evaluate(() => document.body.innerText);
    console.log('📄 Texto (500 chars):', bodyText.slice(0, 500));

    // Buscar saldo disponible
    const patterns = [
      /Disponible en cuentas[^0-9€]*([0-9.,]+\s*€)/i,
      /Disponible[^\n]*\n[^0-9€]*([0-9.,]+\s*€)/i,
      /([0-9]{1,3}(?:\.[0-9]{3})*,[0-9]{2})\s*€/,
    ];

    let balance = null;
    for (const pat of patterns) {
      const m = bodyText.match(pat);
      if (m) { balance = m[1].trim(); break; }
    }

    if (balance) {
      console.log(`\n💰 SALDO DISPONIBLE: ${balance}`);
    } else {
      console.log('\n⚠️  Saldo no encontrado. Ver step3-dashboard.png');
    }

    return { success: true, balance, timestamp: new Date().toISOString() };

  } catch (err) {
    console.error('❌ Error:', err.message);
    await page.screenshot({ path: 'error.png' }).catch(() => {});
    return { success: false, error: err.message };
  } finally {
    await browser.close();
  }
}

scrapeBBVA().then(r => {
  console.log('\n📊 Resultado:', JSON.stringify(r, null, 2));
});
