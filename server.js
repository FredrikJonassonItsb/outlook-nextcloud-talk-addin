/**
 * Simple HTTPS server for localhost development
 * Serves the Outlook add-in with proper CORS headers
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = 3000;
const HOST = 'localhost';

// MIME types
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.xml': 'application/xml'
};

// Generate self-signed certificate if it doesn't exist
function generateCertificate(callback) {
  const certPath = path.join(__dirname, 'localhost.crt');
  const keyPath = path.join(__dirname, 'localhost.key');
  
  if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
    console.log('✓ Using existing SSL certificate');
    callback();
    return;
  }
  
  console.log('Generating self-signed SSL certificate...');
  const cmd = `openssl req -x509 -newkey rsa:2048 -keyout ${keyPath} -out ${certPath} -days 365 -nodes -subj "/CN=localhost"`;
  
  exec(cmd, (error) => {
    if (error) {
      console.error('Failed to generate certificate:', error);
      console.log('Please install OpenSSL or create certificates manually');
      process.exit(1);
    }
    console.log('✓ SSL certificate generated');
    callback();
  });
}

// Start server
function startServer() {
  const options = {
    key: fs.readFileSync(path.join(__dirname, 'localhost.key')),
    cert: fs.readFileSync(path.join(__dirname, 'localhost.crt'))
  };
  
  const server = https.createServer(options, (req, res) => {
    // Parse URL
    let filePath = '.' + req.url;
    if (filePath === './') {
      filePath = './index.html';
    }
    
    // Get file extension
    const extname = String(path.extname(filePath)).toLowerCase();
    const mimeType = MIME_TYPES[extname] || 'application/octet-stream';
    
    // Read and serve file
    fs.readFile(filePath, (error, content) => {
      if (error) {
        if (error.code === 'ENOENT') {
          res.writeHead(404, { 'Content-Type': 'text/html' });
          res.end('<h1>404 Not Found</h1>', 'utf-8');
        } else {
          res.writeHead(500);
          res.end('Server Error: ' + error.code, 'utf-8');
        }
      } else {
        // Set CORS headers
        res.writeHead(200, {
          'Content-Type': mimeType,
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        });
        res.end(content, 'utf-8');
      }
    });
  });
  
  server.listen(PORT, HOST, () => {
    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('  Nextcloud Talk for Outlook - Localhost Development Server');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    console.log(`  🚀 Server running at: https://${HOST}:${PORT}/`);
    console.log('');
    console.log('  📄 Manifest URL:');
    console.log(`     https://${HOST}:${PORT}/manifest-localhost.xml`);
    console.log('');
    console.log('  🔧 Taskpane URL:');
    console.log(`     https://${HOST}:${PORT}/src/taskpane/taskpane.html`);
    console.log('');
    console.log('  ⚠️  Important:');
    console.log('     1. Trust the self-signed certificate in your browser');
    console.log('     2. Visit https://localhost:3000/ and accept the certificate');
    console.log('     3. Then sideload the manifest in Outlook');
    console.log('');
    console.log('  Press Ctrl+C to stop the server');
    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
  });
}

// Main
generateCertificate(() => {
  startServer();
});

