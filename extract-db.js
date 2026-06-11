const fs = require('fs');

function extractTable(sql, tableName, columns) {
  const insertStart = `INSERT INTO \`${tableName}\` VALUES (`;
  const startIdx = sql.indexOf(insertStart);
  if (startIdx === -1) {
    console.log(`Table ${tableName} not found or has no inserts.`);
    return [];
  }
  
  let endIdx = sql.indexOf(`\n/*!40000 ALTER TABLE \`${tableName}\` ENABLE KEYS */;`, startIdx);
  if (endIdx === -1) endIdx = sql.indexOf('\nUNLOCK TABLES;', startIdx);
  if (endIdx === -1) endIdx = sql.length;
  
  let content = sql.substring(startIdx + insertStart.length, endIdx).trim();
  if (content.endsWith(';')) content = content.slice(0, -1);
  
  // The content starts exactly after the first '('

  let allRows = [];
  let rows = [];
  let currentRow = [];
  let currentVal = '';
  let inString = false;
  let escapeNext = false;
  
  for (let i = 0; i < content.length; i++) {
    const c = content[i];
    if (escapeNext) {
      currentVal += c;
      escapeNext = false;
    } else if (c === '\\') {
      currentVal += c;
      escapeNext = true;
    } else if (c === "'") {
      inString = !inString;
      currentVal += c;
    } else if (c === ',' && !inString) {
      currentRow.push(currentVal);
      currentVal = '';
    } else if (c === ')' && !inString) {
      currentRow.push(currentVal);
      currentVal = '';
      rows.push(currentRow);
      currentRow = [];
      // skip over ",(" if present, including spaces
      let nextIdx = i + 1;
      while (nextIdx < content.length && /\s/.test(content[nextIdx])) nextIdx++;
      if (nextIdx < content.length && content[nextIdx] === ',') {
        nextIdx++;
        while (nextIdx < content.length && /\s/.test(content[nextIdx])) nextIdx++;
        if (nextIdx < content.length && content[nextIdx] === '(') {
          i = nextIdx;
        }
      }
    } else {
      currentVal += c;
    }
  }
  
  allRows.push(...rows);
  
  return allRows.map(row => {
    let obj = {};
    columns.forEach((col, idx) => {
      let val = row[idx];
      if (val === undefined) return;
      val = val.trim();
      if (val === 'NULL') {
        val = null;
      } else if (val.startsWith("'") && val.endsWith("'")) {
        // Unescape string
        val = val.substring(1, val.length - 1);
        val = val.replace(/\\'/g, "'").replace(/\\\\/g, "\\").replace(/\\r/g, "\r").replace(/\\n/g, "\n");
        if (val.startsWith('/HIMACAKE/')) {
          val = val.substring(9); // remove /HIMACAKE
        }
      } else if (!isNaN(val)) {
        val = Number(val);
      }
      obj[col] = val;
    });
    return obj;
  });
}

function main() {
  const sql = fs.readFileSync('../himacake195.sql', 'utf8');
  
  const categories = extractTable(sql, 'categories', ['id', 'name', 'slug', 'parent_id', 'icon', 'image', 'show_on_home', 'sort_order', 'status', 'home_slide_rank', 'home_slide_title', 'home_slide_subline', 'home_slide_btn', 'home_slide_href', 'home_slide_bg_css', 'home_slide_image_mobile']);
  const products = extractTable(sql, 'products', ['id', 'category_id', 'sku', 'name', 'slug', 'short_description', 'content_sections', 'price', 'sale_price', 'stock', 'sold_count', 'view_count', 'status', 'main_image', 'youtube_video_id', 'created_at', 'updated_at']);
  const product_variants = extractTable(sql, 'product_variants', ['id', 'product_id', 'variant_name', 'sku', 'price', 'sale_price', 'stock', 'sort_order', 'status', 'image_url']);
  const news = extractTable(sql, 'news', ['id', 'news_category_id', 'title', 'slug', 'summary', 'content', 'image', 'author_id', 'status', 'created_at']);
  const product_attributes = extractTable(sql, 'product_attributes', ['id', 'product_id', 'attribute_id', 'value']);
  const attributes = extractTable(sql, 'attributes', ['id', 'name', 'data_type']);

  if (!fs.existsSync('./data')) {
    fs.mkdirSync('./data');
  }

  fs.writeFileSync('./data/categories.json', JSON.stringify(categories, null, 2));
  fs.writeFileSync('./data/products.json', JSON.stringify(products, null, 2));
  fs.writeFileSync('./data/product_variants.json', JSON.stringify(product_variants, null, 2));
  fs.writeFileSync('./data/news.json', JSON.stringify(news, null, 2));
  fs.writeFileSync('./data/product_attributes.json', JSON.stringify(product_attributes, null, 2));
  fs.writeFileSync('./data/attributes.json', JSON.stringify(attributes, null, 2));

  console.log('Extraction complete.');
}

main();
