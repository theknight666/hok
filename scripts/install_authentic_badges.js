const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '..', 'frontend', 'public', 'images', 'payments');
const tempDir = path.join(__dirname, '..', 'temp_pi');

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// 1. Direct copies from Shopify activemerchant
const shopifyMap = {
  'visa.svg': 'visa.svg',
  'mastercard.svg': 'mastercard.svg',
  'rupay.svg': 'rupay.svg',
  'upi.svg': 'upi.svg',
  'amex.svg': 'amex.svg',
  'gpay.svg': 'gpay.svg',
  'paytm.svg': 'paytm.svg',
  'apple-pay.svg': 'apple-pay.svg',
  'paypal.svg': 'paypal.svg',
  'netbanking.svg': 'netbanking.svg',
  'maestro.svg': 'maestro.svg',
  'diners.svg': 'diners.svg',
  'discover.svg': 'discover.svg',
  'jcb.svg': 'jcb.svg',
  'amazon.svg': 'amazon.svg',
  'stripe.svg': 'stripe.svg',
  'samsung_pay.svg': 'samsung_pay.svg'
};

for (const [outName, srcName] of Object.entries(shopifyMap)) {
  const srcPath = path.join(tempDir, srcName);
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, path.join(targetDir, outName));
    console.log(`Copied ${outName}`);
  } else {
    console.error(`Missing ${srcName}`);
  }
}

// 2. PhonePe: Authentic PhonePe brand SVG wrapped in Shopify standard 38x24 card
if (fs.existsSync(path.join(tempDir, 'phonepe_full.svg'))) {
  const full = fs.readFileSync(path.join(tempDir, 'phonepe_full.svg'), 'utf8');
  const innerMatch = full.replace(/<\?xml[^>]*\?>/, '').match(/<svg[^>]*>([\s\S]*?)<\/svg>/);
  const inner = innerMatch ? innerMatch[1] : '';
  const phonePeSvg = `<svg xmlns="http://www.w3.org/2000/svg" role="img" viewBox="0 0 38 24" width="38" height="24" aria-labelledby="pi-phonepe">
  <title id="pi-phonepe">PhonePe</title>
  <path d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3z" fill="#000" opacity=".07"/>
  <path d="M35 1c1.1 0 2 .9 2 2v18c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V3c0-1.1.9-2 2-2h32" fill="#FFF"/>
  <svg x="4" y="5.5" width="30" height="13" viewBox="0 0 230 69.746292">
    ${inner}
  </svg>
</svg>`;
  fs.writeFileSync(path.join(targetDir, 'phonepe.svg'), phonePeSvg.trim());
  console.log('Created authentic phonepe.svg');
}

// 3. Razorpay: Authentic Razorpay brand SVG wrapped in Shopify standard 38x24 card
if (fs.existsSync(path.join(tempDir, 'razorpay_full.svg'))) {
  const full = fs.readFileSync(path.join(tempDir, 'razorpay_full.svg'), 'utf8');
  const innerMatch = full.replace(/<\?xml[^>]*\?>/, '').match(/<svg[^>]*>([\s\S]*?)<\/svg>/);
  const inner = innerMatch ? innerMatch[1] : '';
  const razorpaySvg = `<svg xmlns="http://www.w3.org/2000/svg" role="img" viewBox="0 0 38 24" width="38" height="24" aria-labelledby="pi-razorpay">
  <title id="pi-razorpay">Razorpay</title>
  <path d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3z" fill="#000" opacity=".07"/>
  <path d="M35 1c1.1 0 2 .9 2 2v18c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V3c0-1.1.9-2 2-2h32" fill="#FFF"/>
  <svg x="3" y="7" width="32" height="10" viewBox="0 0 1896 401">
    ${inner}
  </svg>
</svg>`;
  fs.writeFileSync(path.join(targetDir, 'razorpay.svg'), razorpaySvg.trim());
  console.log('Created authentic razorpay.svg');
}

// Remove cashondelivery and any deprecated badges
const removed = ['cod.svg', 'bhim.svg', 'secure-ssl.svg'];
removed.forEach(r => {
  const p = path.join(targetDir, r);
  if (fs.existsSync(p)) {
    fs.unlinkSync(p);
    console.log(`Deleted obsolete ${r}`);
  }
});

console.log('Finished updating payment badges to authentic brand assets!');
