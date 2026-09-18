const https = require('https');

https.get('https://bgsdc.com/', (resp) => {
  let data = '';
  resp.on('data', (chunk) => { data += chunk; });
  resp.on('end', () => {
    const regex = /<img[^>]*src=["'](https:\/\/bgsdc\.com\/wp-content\/uploads\/[^"']+\.svg)["'][^>]*>/g;
    let match;
    const urls = new Set();
    while ((match = regex.exec(data)) !== null) {
      urls.add(match[1]);
    }
    console.log(Array.from(urls).join('\n'));
  });
}).on("error", (err) => {
  console.log("Error: " + err.message);
});