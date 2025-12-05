#!/usr/bin/env node

/**
 * Script to start both BlockVote backend and legacy frontend servers simultaneously
 * 
 * This script will:
 * 1. Start the backend server (Node.js/Express) on port 6001
 * 2. Serve the legacy frontend static files (HTML/CSS/JS) on port 5502
 * 3. Provide URLs to access both services
 * 
 * Note: For the modern React frontend, use: cd frontend && npm run dev
 */

const { spawn } = require('child_process');
const path = require('path');
const net = require('net');

// Configuration
let BACKEND_PORT = 6001;
let FRONTEND_PORT = 5502;
const PROJECT_ROOT = __dirname;

// Paths
const BACKEND_DIR = path.join(PROJECT_ROOT, 'backend');
const FRONTEND_DIR = path.join(PROJECT_ROOT, 'legacy-frontend');

console.log('🚀 Starting BlockVote Development Servers...\n');

// Function to check if a port is available
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', () => resolve(false));
    server.once('listening', () => {
      server.close();
      resolve(true);
    });
    server.listen(port);
  });
}

// Function to find an available port starting from a given port
async function findAvailablePort(startPort) {
  let port = startPort;
  while (!(await isPortAvailable(port))) {
    port++;
  }
  return port;
}

// Function to start backend server
function startBackend() {
  console.log('🔧 Starting Backend Server on port ' + BACKEND_PORT + '...');

  const backendProcess = spawn('node', ['src/index.js'], {
    cwd: BACKEND_DIR,
    env: { ...process.env, PORT: BACKEND_PORT, NODE_OPTIONS: '--no-warnings' },
    stdio: 'inherit'
  });

  backendProcess.on('error', (err) => {
    console.error('❌ Failed to start backend server:', err.message);
  });

  backendProcess.on('close', (code) => {
    if (code !== 0) {
      console.log(` Backend server exited with code ${code}`);
    }
  });

  return backendProcess;
}

// Function to start frontend server
function startFrontend() {
  console.log('🎨 Starting Frontend Server...');

  // Try to use Node.js built-in modules first, fallback to Python if needed
  try {
    const http = require('http');
    const fs = require('fs');
    const url = require('url');
    const path = require('path');

    // MIME types for static files
    const mimeTypes = {
      '.html': 'text/html',
      '.js': 'text/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.wav': 'audio/wav',
      '.mp4': 'video/mp4',
      '.woff': 'application/font-woff',
      '.ttf': 'application/font-ttf',
      '.eot': 'application/vnd.ms-fontobject',
      '.otf': 'application/font-otf',
      '.wasm': 'application/wasm'
    };

    const server = http.createServer((request, response) => {
      const parsedUrl = url.parse(request.url);
      let pathname = `.${parsedUrl.pathname}`;

      // Default to index.html for root path
      if (pathname === './') {
        pathname = './index.html';
      }

      const ext = path.parse(pathname).ext;
      const map = mimeTypes[ext] || 'text/plain';

      fs.readFile(path.join(FRONTEND_DIR, pathname), (err, data) => {
        if (err) {
          response.writeHead(404);
          response.end('File not found');
          return;
        }
        response.writeHead(200, { 'Content-Type': map });
        response.end(data);
      });
    });

    server.listen(FRONTEND_PORT, () => {
      console.log(`✅ Frontend server is running at http://localhost:${FRONTEND_PORT}/`);
    });

    return server;
  } catch (error) {
    console.log('⚠️  Node.js static server failed, trying Python...');

    // Fallback to Python server
    const frontendProcess = spawn('python3', ['-m', 'http.server', FRONTEND_PORT.toString()], {
      cwd: FRONTEND_DIR,
      stdio: 'inherit'
    });

    frontendProcess.on('error', (err) => {
      console.error('❌ Failed to start frontend server:', err.message);
    });

    frontendProcess.on('close', (code) => {
      if (code !== 0) {
        console.log(` Frontend server exited with code ${code}`);
      }
    });

    return frontendProcess;
  }
}

// Find available ports and start both servers
(async () => {
  BACKEND_PORT = await findAvailablePort(BACKEND_PORT);
  FRONTEND_PORT = await findAvailablePort(FRONTEND_PORT);

  const backend = startBackend();
  const frontend = startFrontend();

  // Display URLs after a short delay to allow servers to start
  setTimeout(() => {
    console.log('\n🔗 Access your application:');
    console.log(`   Backend API: http://localhost:${BACKEND_PORT}/`);
    console.log(`   Frontend UI: http://localhost:${FRONTEND_PORT}/\n`);
    console.log('ℹ️  Press Ctrl+C to stop both servers\n');
  }, 3000);
})();

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down servers...');
  backend.kill();
  if (frontend.close) {
    frontend.close();
  } else {
    frontend.kill();
  }
  process.exit(0);
});