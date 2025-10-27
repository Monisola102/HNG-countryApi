const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateSummaryImage(countries, lastRefreshedAt) {
  const cacheDir = path.join(__dirname, '../cache');
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }

  const top5 = countries
    .sort((a, b) => (b.estimated_gdp || 0) - (a.estimated_gdp || 0))
    .slice(0, 5);

  const lines = [
    `Total countries: ${countries.length}`,
    `Top 5 by GDP:`,
    ...top5.map((c) => `${c.name}: ${c.estimated_gdp?.toFixed(2)}`),
    `Last refreshed: ${lastRefreshedAt.toISOString()}`
  ];

  const svgText = lines
    .map((line, i) => `<tspan x="10" y="${30 + i * 25}">${line}</tspan>`)
    .join('');

  const svg = `
  <svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#f4f6fc"/>
    <text font-size="16" fill="#000" font-family="Arial, sans-serif">
      ${svgText}
    </text>
  </svg>`;

  const buffer = Buffer.from(svg);

  const filePath = path.join(cacheDir, 'summary.png');
  await sharp(buffer).png().toFile(filePath);

  console.log('Summary image generated at:', filePath);
}

module.exports = generateSummaryImage;
