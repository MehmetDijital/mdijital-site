import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const publicDir = path.join(process.cwd(), 'public');

async function convertLogosToWebP() {
  console.log('Converting logos to WebP...');
  
  const logos = [
    { input: 'mdijital-logo-white.svg', output: 'mdijital-logo-white.webp' },
    { input: 'mdijital-logo-black.svg', output: 'mdijital-logo-black.webp' },
  ];

  for (const logo of logos) {
    const inputPath = path.join(publicDir, logo.input);
    const outputPath = path.join(publicDir, logo.output);

    if (!fs.existsSync(inputPath)) {
      console.warn(`Logo not found: ${logo.input}`);
      continue;
    }

    try {
      await sharp(inputPath)
        .resize(1200, null, { withoutEnlargement: true })
        .webp({ quality: 90 })
        .toFile(outputPath);
      
      console.log(`✓ Created ${logo.output}`);
    } catch (error) {
      console.error(`Error converting ${logo.input}:`, error);
    }
  }
}

async function generateFavicons() {
  console.log('Generating favicons...');

  // Read SVG logo
  const logoSvg = path.join(publicDir, 'mdijital-logo-white.svg');
  
  if (!fs.existsSync(logoSvg)) {
    console.warn('Logo SVG not found, creating placeholder favicons...');
    await createPlaceholderFavicons();
    return;
  }

  const sizes = [
    { size: 16, name: 'favicon-16x16.png' },
    { size: 32, name: 'favicon-32x32.png' },
    { size: 180, name: 'apple-touch-icon.png' },
    { size: 192, name: 'android-chrome-192x192.png' },
    { size: 512, name: 'android-chrome-512x512.png' },
  ];

  for (const { size, name } of sizes) {
    try {
      await sharp(logoSvg)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 1 },
        })
        .png()
        .toFile(path.join(publicDir, name));
      
      console.log(`✓ Created ${name} (${size}x${size})`);
    } catch (error) {
      console.error(`Error creating ${name}:`, error);
    }
  }

  // Create ICO file (16x16 and 32x32 combined)
  try {
    const favicon16 = await sharp(logoSvg)
      .resize(16, 16, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 1 },
      })
      .png()
      .toBuffer();

    const favicon32 = await sharp(logoSvg)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 1 },
      })
      .png()
      .toBuffer();

    // For ICO, we'll use the 32x32 PNG as favicon.ico
    // Most modern browsers accept PNG as favicon.ico
    fs.writeFileSync(
      path.join(publicDir, 'favicon.ico'),
      favicon32
    );
    
    console.log('✓ Created favicon.ico');
  } catch (error) {
    console.error('Error creating favicon.ico:', error);
  }
}

async function createPlaceholderFavicons() {
  const sizes = [
    { size: 16, name: 'favicon-16x16.png' },
    { size: 32, name: 'favicon-32x32.png' },
    { size: 180, name: 'apple-touch-icon.png' },
    { size: 192, name: 'android-chrome-192x192.png' },
    { size: 512, name: 'android-chrome-512x512.png' },
  ];

  for (const { size, name } of sizes) {
    const svg = `
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${size}" height="${size}" fill="#000000"/>
        <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size * 0.6}" font-weight="bold" fill="#39ff14" text-anchor="middle" dominant-baseline="central">M</text>
      </svg>
    `;

    try {
      await sharp(Buffer.from(svg))
        .png()
        .toFile(path.join(publicDir, name));
      
      console.log(`✓ Created placeholder ${name}`);
    } catch (error) {
      console.error(`Error creating ${name}:`, error);
    }
  }

  // Create favicon.ico
  const svg32 = `
    <svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" fill="#000000"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="#39ff14" text-anchor="middle" dominant-baseline="central">M</text>
    </svg>
  `;

  try {
    const favicon32 = await sharp(Buffer.from(svg32))
      .png()
      .toBuffer();
    
    fs.writeFileSync(
      path.join(publicDir, 'favicon.ico'),
      favicon32
    );
    
    console.log('✓ Created placeholder favicon.ico');
  } catch (error) {
    console.error('Error creating favicon.ico:', error);
  }
}

async function generateOGImage() {
  console.log('Generating OG image...');

  const logoSvg = path.join(publicDir, 'mdijital-logo-white.svg');
  const outputPath = path.join(publicDir, 'og-image.jpg');

  if (!fs.existsSync(logoSvg)) {
    console.warn('Logo SVG not found, creating placeholder OG image...');
    await createPlaceholderOGImage();
    return;
  }

  try {
    // Create 1200x630 image with logo centered
    const logoBuffer = await sharp(logoSvg)
      .resize(600, null, { withoutEnlargement: true })
      .toBuffer();

    await sharp({
      create: {
        width: 1200,
        height: 630,
        channels: 3,
        background: { r: 0, g: 0, b: 0 },
      },
    })
      .composite([
        {
          input: logoBuffer,
          top: 315 - (await sharp(logoBuffer).metadata()).height! / 2,
          left: 600 - (await sharp(logoBuffer).metadata()).width! / 2,
        },
      ])
      .jpeg({ quality: 90 })
      .toFile(outputPath);

    console.log('✓ Created og-image.jpg (1200x630)');
  } catch (error) {
    console.error('Error creating OG image:', error);
    await createPlaceholderOGImage();
  }
}

async function createPlaceholderOGImage() {
  const svg = `
    <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="630" fill="#000000"/>
      <text x="600" y="280" font-family="Arial, sans-serif" font-size="120" font-weight="bold" fill="#39ff14" text-anchor="middle">M DIJITAL</text>
      <text x="600" y="380" font-family="Arial, sans-serif" font-size="40" fill="#39ff14" text-anchor="middle">Akıllı Sistemler. İnsan Merkezli Gelecek.</text>
    </svg>
  `;

  try {
    await sharp(Buffer.from(svg))
      .jpeg({ quality: 90 })
      .toFile(path.join(publicDir, 'og-image.jpg'));

    console.log('✓ Created placeholder og-image.jpg');
  } catch (error) {
    console.error('Error creating placeholder OG image:', error);
  }
}

async function main() {
  console.log('🚀 Generating assets...\n');
  
  await convertLogosToWebP();
  console.log('');
  
  await generateFavicons();
  console.log('');
  
  await generateOGImage();
  console.log('');
  
  console.log('✅ All assets generated successfully!');
}

main().catch(console.error);

