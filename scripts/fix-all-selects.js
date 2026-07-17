const fs = require('fs');

function replaceInFile(filePath, replacements) {
  let content = fs.readFileSync(filePath, 'utf8');
  for (const [search, replace] of replacements) {
    content = content.replace(search, replace);
  }
  fs.writeFileSync(filePath, content);
  console.log(`Updated ${filePath}`);
}

// 1. produk/page.tsx
replaceInFile('src/app/(dashboard)/produk/page.tsx', [
  [
    '<Select name="category" defaultValue={category}>',
    `<Select name="category" defaultValue={category} items={[{value:'all',label:'Semua Kategori'},{value:'gold',label:'Emas'},{value:'silver',label:'Perak'}]}>`
  ]
]);

// 2. stok/page.tsx
replaceInFile('src/app/(dashboard)/stok/page.tsx', [
  [
    '<Select name="category" defaultValue={category}>',
    `<Select name="category" defaultValue={category} items={[{value:'all',label:'Semua Kategori'},{value:'gold',label:'Emas'},{value:'silver',label:'Perak'}]}>`
  ]
]);

// 3. product-form-dialog.tsx
replaceInFile('src/components/produk/product-form-dialog.tsx', [
  [
    '<Select name="category" defaultValue={product?.category || "gold"} required>',
    `<Select name="category" defaultValue={product?.category || "gold"} required items={[{value:'gold',label:'Emas'},{value:'silver',label:'Perak'}]}>`
  ],
  [
    '<Select name="unit" defaultValue={product?.unit || "gram"} required>',
    `<Select name="unit" defaultValue={product?.unit || "gram"} required items={[{value:'gram',label:'Gram'},{value:'dirham',label:'Dirham'},{value:'rupiya',label:'Rupiya'}]}>`
  ]
]);

// 4. daily-prices-client.tsx
replaceInFile('src/components/harga-harian/daily-prices-client.tsx', [
  [
    '<Select defaultValue={category} onValueChange={handleCategoryChange}>',
    `<Select defaultValue={category} onValueChange={handleCategoryChange} items={[{value:'all',label:'Semua Kategori'},{value:'gold',label:'Emas'},{value:'silver',label:'Perak'}]}>`
  ]
]);

// 5. stock-in-form.tsx
replaceInFile('src/components/barang-masuk/stock-in-form.tsx', [
  [
    '<Select name="product_id" required>',
    `<Select name="product_id" required items={products.map(p => ({value: p.id, label: \`\${p.item_code} - \${p.name} (\${p.weight} \${p.unit})\`}))}>`
  ],
  [
    '<Select name="source_type" defaultValue="supplier" required>',
    `<Select name="source_type" defaultValue="supplier" required items={[{value:'supplier',label:'Supplier'},{value:'opening_stock',label:'Stok Awal'},{value:'adjustment',label:'Penyesuaian (Koreksi)'}]}>`
  ]
]);

// 6. buyback-client.tsx
replaceInFile('src/components/buyback/buyback-client.tsx', [
  [
    '<Select value={customerId} onValueChange={handleCustomerSelect}>',
    `<Select value={customerId} onValueChange={handleCustomerSelect} items={[{value:'new',label:'+ Penjual Baru (Ketik Manual)'}, ...customers.map(c => ({value: c.id, label: c.name}))]}>`
  ],
  [
    '<Select value={selectedProductId} onValueChange={handleProductSelect}>',
    `<Select value={selectedProductId} onValueChange={handleProductSelect} items={products.map(p => ({value: p.id, label: \`\${p.item_code} - \${p.name} (\${p.weight} \${p.unit})\`}))}>`
  ]
]);

// 7. pos-client.tsx
replaceInFile('src/components/invoice/pos-client.tsx', [
  [
    '<Select value={customerId} onValueChange={handleCustomerSelect}>',
    `<Select value={customerId} onValueChange={handleCustomerSelect} items={[{value:'new',label:'+ Customer Baru (Ketik Manual)'}, ...customers.map(c => ({value: c.id, label: \`\${c.name} \${c.customer_type === 'reseller' ? '(Reseller)' : ''}\`.trim()}))]}>`
  ],
  [
    '<Select value={selectedProductId} onValueChange={handleProductSelect}>',
    `<Select value={selectedProductId} onValueChange={handleProductSelect} items={products.map(p => ({value: p.id, label: \`\${p.item_code} - \${p.name} (\${p.weight} \${p.unit})\`}))}>`
  ]
]);

// 8. laporan-client.tsx
replaceInFile('src/components/laporan/laporan-client.tsx', [
  [
    '<Select value={timeRange} onValueChange={(val: any) => setTimeRange(val)}>',
    `<Select value={timeRange} onValueChange={(val: any) => setTimeRange(val)} items={[{value:'today',label:'Hari Ini'},{value:'week',label:'7 Hari Terakhir'},{value:'month',label:'Bulan Ini'},{value:'year',label:'Tahun Ini'}]}>`
  ],
  [
    '<Select value={category} onValueChange={setCategory}>',
    `<Select value={category} onValueChange={setCategory} items={[{value:'all',label:'Semua Kategori'},{value:'gold',label:'Emas'},{value:'silver',label:'Perak'}]}>`
  ],
  [
    '<Select value={type} onValueChange={(val: any) => setType(val)}>',
    `<Select value={type} onValueChange={(val: any) => setType(val)} items={[{value:'all',label:'Semua Transaksi'},{value:'sales',label:'Penjualan'},{value:'buyback',label:'Buyback'}]}>`
  ]
]);

console.log('Done!');
