const fs = require('fs');
const path = require('path');

const productsFile = './data/products.json';
const variantsFile = './data/product_variants.json';

const products = JSON.parse(fs.readFileSync(productsFile, 'utf8'));
const variants = JSON.parse(fs.readFileSync(variantsFile, 'utf8'));

function getAllImages(dir, fileList = []) {
  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      if (fs.statSync(filePath).isDirectory()) {
        getAllImages(filePath, fileList);
      } else if (/\.(png|jpe?g|gif|webp)$/i.test(filePath)) {
        // Convert to web path starting from /
        const webPath = '/' + filePath.replace(/\\/g, '/').replace(/^public\//, '');
        fileList.push(webPath);
      }
    }
  }
  return fileList;
}

const allProductImages = [
  ...getAllImages('./public/assets/images/products'),
  ...getAllImages('./public/uploads/products')
];

if (allProductImages.length === 0) {
  console.log('No valid images found to use as fallback.');
  process.exit(1);
}

let imagePoolIndex = 0;
function getNextImage() {
  const img = allProductImages[imagePoolIndex];
  imagePoolIndex = (imagePoolIndex + 1) % allProductImages.length;
  return img;
}

let updatedProducts = 0;
for (const p of products) {
  // Fix /HIMACAKE/ in content_sections
  if (p.content_sections) {
    p.content_sections = p.content_sections.replace(/\/HIMACAKE\//g, '/');
  }

  // Fix main_image
  if (!p.main_image || !fs.existsSync(path.join('./public', p.main_image))) {
    p.main_image = getNextImage();
    updatedProducts++;
  }
}

let updatedVariants = 0;
for (const v of variants) {
  if (!v.image_url || !fs.existsSync(path.join('./public', v.image_url))) {
    v.image_url = getNextImage();
    updatedVariants++;
  }
}

fs.writeFileSync(productsFile, JSON.stringify(products, null, 2));
fs.writeFileSync(variantsFile, JSON.stringify(variants, null, 2));

console.log(`Fixed ${updatedProducts} product images and ${updatedVariants} variant images.`);
console.log(`Total unique images in pool: ${allProductImages.length}`);
