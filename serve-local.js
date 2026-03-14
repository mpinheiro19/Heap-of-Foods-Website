const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;
const BASE_PATH = '/Heap-of-Foods-Recipe-Book';
const OUT_DIR = path.join(__dirname, 'out');

const server = http.createServer((req, res) => {
  let filePath = req.url;
  
  if (filePath.startsWith(BASE_PATH)) {
    filePath = filePath.slice(BASE_PATH.length);
  }
  
  if (filePath === '/') {
    filePath = '/index.html';
  }
  
  const fullPath = path.join(OUT_DIR, filePath);
  
  if (!fullPath.startsWith(OUT_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }
  
  if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
    const indexPath = path.join(fullPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      serveFile(indexPath, res);
      return;
    }
  }
  
  if (fs.existsSync(fullPath)) {
    serveFile(fullPath, res);
  } else {
    const notFoundPath = path.join(OUT_DIR, '404.html');
    if (fs.existsSync(notFoundPath)) {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end(fs.readFileSync(notFoundPath));
    } else {
      res.writeHead(404);
      res.end('Not Found');
    }
  }
});

function serveFile(filePath, res) {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
  };
  
  const mimeType = mimeTypes[ext] || 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': mimeType });
  res.end(fs.readFileSync(filePath));
}

server.listen(PORT, () => {
  console.log(`\nServer open in http://localhost:${PORT}${BASE_PATH}/\n`);
  console.log(`Link: http://localhost:${PORT}${BASE_PATH}/`);
});
