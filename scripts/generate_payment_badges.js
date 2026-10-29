const fs = require('fs');
const path = require('path');
const https = require('https');

const outDir = path.join(__dirname, '..', 'frontend', 'public', 'images', 'payments');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

function fetchSvgPath(name) {
  return new Promise((resolve, reject) => {
    const url = `https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/${name}.svg`;
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed ${name}: ${res.statusCode}`));
      }
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        const match = body.match(/<path\s+d="([^"]+)"/);
        if (match) resolve(match[1]);
        else reject(new Error(`No path in ${name}`));
      });
    }).on('error', reject);
  });
}

function wrapCard(inner, title, bg = '#FFFFFF', stroke = '#E2E8F0') {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 54 34" width="54" height="34">
  <title>${title}</title>
  <rect width="54" height="34" rx="4" fill="${bg}" stroke="${stroke}" stroke-width="1"/>
  ${inner}
</svg>`;
}

function wrapIcon(pathD, fill, title, scaleW = 38, scaleH = 22, bg = '#FFFFFF', stroke = '#E2E8F0') {
  const x = Math.round((54 - scaleW) / 2);
  const y = Math.round((34 - scaleH) / 2);
  return wrapCard(
    `<svg x="${x}" y="${y}" width="${scaleW}" height="${scaleH}" viewBox="0 0 24 24">
    <path d="${pathD}" fill="${fill}"/>
  </svg>`,
    title,
    bg,
    stroke
  );
}

async function main() {
  const icons = [
    'visa', 'mastercard', 'americanexpress', 'dinersclub', 'discover', 'jcb',
    'applepay', 'googlepay', 'phonepe', 'paytm', 'paypal', 'razorpay'
  ];

  const paths = {};
  for (const name of icons) {
    try {
      paths[name] = await fetchSvgPath(name);
      console.log(`Fetched ${name}`);
    } catch (e) {
      console.error(e.message);
    }
  }

  // 1. Visa
  if (paths.visa) {
    fs.writeFileSync(path.join(outDir, 'visa.svg'), wrapIcon(paths.visa, '#1434CB', 'Visa', 38, 22));
  }

  // 2. Mastercard
  const mastercardSvg = wrapCard(
    `<circle cx="21" cy="17" r="9.5" fill="#EB001B"/>
  <circle cx="33" cy="17" r="9.5" fill="#F79E1B"/>
  <path d="M27 9.8a9.5 9.5 0 0 1 0 14.4 9.5 9.5 0 0 1 0-14.4z" fill="#FF5F00"/>`,
    'Mastercard'
  );
  fs.writeFileSync(path.join(outDir, 'mastercard.svg'), mastercardSvg);

  // 3. RuPay
  const rupaySvg = wrapCard(
    `<g transform="translate(6, 9)">
    <path d="M2.5 16L7.5 0h4.5l-5 16H2.5z" fill="#097939"/>
    <path d="M8.5 16L13.5 0h4.5l-5 16H8.5z" fill="#ED752E"/>
    <text x="17" y="13" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="900" font-style="italic" font-size="13.5" fill="#092042" letter-spacing="-0.5">RuPay</text>
  </g>`,
    'RuPay'
  );
  fs.writeFileSync(path.join(outDir, 'rupay.svg'), rupaySvg);

  // 4. UPI
  const upiSvg = wrapCard(
    `<g transform="translate(9, 9)">
    <path d="M2 16L6.5 0h4l-4.5 16H2z" fill="#097939"/>
    <path d="M7.5 16L12 0h4l-4.5 16H7.5z" fill="#ED752E"/>
    <text x="16" y="13.5" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="14.5" fill="#1C252C" letter-spacing="0.5">UPI</text>
  </g>`,
    'UPI'
  );
  fs.writeFileSync(path.join(outDir, 'upi.svg'), upiSvg);

  // 5. American Express
  const amexSvg = wrapCard(
    `<rect x="3" y="3" width="48" height="28" rx="2.5" fill="#006FCF"/>
  <rect x="5.5" y="5.5" width="43" height="23" rx="2" fill="none" stroke="#FFFFFF" stroke-opacity="0.4" stroke-width="0.8"/>
  <text x="27" y="21" text-anchor="middle" font-family="'Arial Black', Impact, sans-serif" font-weight="900" font-size="10.5" fill="#FFFFFF" letter-spacing="1.2">AMEX</text>`,
    'American Express',
    '#006FCF',
    '#005ba8'
  );
  fs.writeFileSync(path.join(outDir, 'amex.svg'), amexSvg);

  // 6. Google Pay
  if (paths.googlepay) {
    fs.writeFileSync(path.join(outDir, 'gpay.svg'), wrapIcon(paths.googlepay, '#3C4043', 'Google Pay', 38, 22));
  }

  // 7. PhonePe
  if (paths.phonepe) {
    fs.writeFileSync(path.join(outDir, 'phonepe.svg'), wrapIcon(paths.phonepe, '#6739B7', 'PhonePe', 28, 24));
  }

  // 8. Paytm
  if (paths.paytm) {
    fs.writeFileSync(path.join(outDir, 'paytm.svg'), wrapIcon(paths.paytm, '#00B9F5', 'Paytm', 40, 22));
  }

  // 9. Apple Pay
  if (paths.applepay) {
    fs.writeFileSync(path.join(outDir, 'apple-pay.svg'), wrapIcon(paths.applepay, '#000000', 'Apple Pay', 38, 22));
  }

  // 10. PayPal
  if (paths.paypal) {
    fs.writeFileSync(path.join(outDir, 'paypal.svg'), wrapIcon(paths.paypal, '#003087', 'PayPal', 28, 24));
  }

  // 11. Diners Club
  if (paths.dinersclub) {
    fs.writeFileSync(path.join(outDir, 'diners.svg'), wrapIcon(paths.dinersclub, '#004A97', 'Diners Club', 32, 24));
  }

  // 12. Discover
  if (paths.discover) {
    fs.writeFileSync(path.join(outDir, 'discover.svg'), wrapIcon(paths.discover, '#FF6000', 'Discover', 38, 22));
  }

  // 13. JCB
  if (paths.jcb) {
    fs.writeFileSync(path.join(outDir, 'jcb.svg'), wrapIcon(paths.jcb, '#0E4284', 'JCB', 30, 24));
  }

  // 14. Razorpay
  if (paths.razorpay) {
    fs.writeFileSync(path.join(outDir, 'razorpay.svg'), wrapIcon(paths.razorpay, '#0C2340', 'Razorpay', 30, 24));
  }

  // 15. BHIM
  const bhimSvg = wrapCard(
    `<g transform="translate(7, 10)">
    <polygon points="0,14 5,0 9.5,0 4.5,14" fill="#009A44"/>
    <polygon points="6.5,14 11.5,0 16,0 11,14" fill="#F15A24"/>
    <text x="17" y="12" font-family="'Arial Black', Impact, sans-serif" font-weight="900" font-size="12" fill="#0B2B5C" letter-spacing="0.5">BHIM</text>
  </g>`,
    'BHIM UPI'
  );
  fs.writeFileSync(path.join(outDir, 'bhim.svg'), bhimSvg);

  // 16. Maestro
  const maestroSvg = wrapCard(
    `<circle cx="21" cy="17" r="9.5" fill="#0061A8"/>
  <circle cx="33" cy="17" r="9.5" fill="#EB001B"/>
  <path d="M27 9.8a9.5 9.5 0 0 1 0 14.4 9.5 9.5 0 0 1 0-14.4z" fill="#6A5ACD"/>`,
    'Maestro'
  );
  fs.writeFileSync(path.join(outDir, 'maestro.svg'), maestroSvg);

  // 17. Net Banking
  const netbankingSvg = wrapCard(
    `<g transform="translate(6, 6)">
    <path d="M11 2L2 7.5h18L11 2zm-7 7.5v6.5h2.5v-6.5H4zm5 0v6.5h2.5v-6.5H9zm5 0v6.5h2.5v-6.5H14zm-12 8.5v2.5h18V18H2z" fill="#006699"/>
    <text x="23" y="10.5" font-family="-apple-system, BlinkMacSystemFont, Arial, sans-serif" font-weight="800" font-size="7.5" fill="#0A2540" letter-spacing="0.3">NET</text>
    <text x="23" y="18.5" font-family="-apple-system, BlinkMacSystemFont, Arial, sans-serif" font-weight="800" font-size="7.5" fill="#0A2540" letter-spacing="0.3">BANK</text>
  </g>`,
    'Net Banking'
  );
  fs.writeFileSync(path.join(outDir, 'netbanking.svg'), netbankingSvg);

  // 18. Cash on Delivery (COD)
  const codSvg = wrapCard(
    `<g transform="translate(6, 6)">
    <rect x="1" y="4" width="18" height="13" rx="2" fill="none" stroke="#16A34A" stroke-width="1.8"/>
    <circle cx="10" cy="10.5" r="2.8" fill="none" stroke="#16A34A" stroke-width="1.4"/>
    <text x="22" y="10.5" font-family="-apple-system, BlinkMacSystemFont, Arial, sans-serif" font-weight="900" font-size="8" fill="#16A34A" letter-spacing="0.4">CASH</text>
    <text x="22" y="18.5" font-family="-apple-system, BlinkMacSystemFont, Arial, sans-serif" font-weight="700" font-size="7" fill="#1F2937" letter-spacing="0.3">ON DEL</text>
  </g>`,
    'Cash on Delivery'
  );
  fs.writeFileSync(path.join(outDir, 'cod.svg'), codSvg);

  // 19. 100% Secure SSL
  const secureSvg = wrapCard(
    `<g transform="translate(6, 6)">
    <path d="M10 2L3 5.5v5.5c0 4.8 3 9.2 7 10.5 4-1.3 7-5.7 7-10.5V5.5L10 2z" fill="#B38E46"/>
    <path d="M10 6.5a2 2 0 0 0-2 2v1h-.5a1 1 0 0 0-1 1v3.5a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1V10.5a1 1 0 0 0-1-1H12v-1a2 2 0 0 0-2-2zm0 1a1 1 0 0 1 1 1v1H9v-1a1 1 0 0 1 1-1z" fill="#FFFFFF"/>
    <text x="21" y="10.5" font-family="-apple-system, BlinkMacSystemFont, Arial, sans-serif" font-weight="900" font-size="7.5" fill="#B38E46" letter-spacing="0.3">100%</text>
    <text x="21" y="18.5" font-family="-apple-system, BlinkMacSystemFont, Arial, sans-serif" font-weight="700" font-size="7" fill="#1F2937" letter-spacing="0.3">SECURE</text>
  </g>`,
    '100% Secure Checkout',
    '#FAFAF9',
    '#E7E5E4'
  );
  fs.writeFileSync(path.join(outDir, 'secure-ssl.svg'), secureSvg);

  console.log('All 19 badge SVGs regenerated successfully!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
