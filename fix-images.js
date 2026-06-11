const fs = require('fs');
const path = require('path');

const productsFile = './data/products.json';
const variantsFile = './data/product_variants.json';

const products = JSON.parse(fs.readFileSync(productsFile, 'utf8'));
const variants = JSON.parse(fs.readFileSync(variantsFile, 'utf8'));

// Find a valid image to use as fallback
let fallbackImage = '/assets/images/placeholder.svg';
for (const p of products) {
  if (p.main_image && fs.existsSync(path.join('./public', p.main_image))) {
    fallbackImage = p.main_image;
    break;
  }
}

console.log('Using fallback image:', fallbackImage);

let updatedProducts = 0;
for (const p of products) {
  if (!p.main_image || !fs.existsSync(path.join('./public', p.main_image))) {
    p.main_image = fallbackImage;
    updatedProducts++;
  }
}

let updatedVariants = 0;
for (const v of variants) {
  if (!v.image_url || !fs.existsSync(path.join('./public', v.image_url))) {
    v.image_url = fallbackImage;
    updatedVariants++;
  }
}

fs.writeFileSync(productsFile, JSON.stringify(products, null, 2));
fs.writeFileSync(variantsFile, JSON.stringify(variants, null, 2));

console.log(`Fixed ${updatedProducts} products and ${updatedVariants} variants.`);
