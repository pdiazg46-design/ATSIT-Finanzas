const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');

let mainWindow;
let serverProcess;
const PORT = 3000;

function checkServerReady(url, callback) {
    const request = http.get(url, (res) => {
        if (res.statusCode === 200 || res.statusCode === 302 || res.statusCode === 307) {
            callback(true);
        } else {
            setTimeout(() => checkServerReady(url, callback), 300);
        }
    });
    request.on('error', () => {
        setTimeout(() => checkServerReady(url, callback), 300);
    });
}

function startNextServer() {
    const isDev = !app.isPackaged;

    if (isDev) {
        serverProcess = spawn('npm.cmd', ['run', 'dev'], {
            cwd: __dirname,
            shell: true,
            env: { ...process.env, PORT: PORT.toString() }
        });
    } else {
        const nextBin = path.join(__dirname, 'node_modules', 'next', 'dist', 'bin', 'next');
        serverProcess = spawn(process.execPath, [nextBin, 'start', '-p', PORT.toString()], {
            cwd: __dirname,
            env: { ...process.env, NODE_ENV: 'production', PORT: PORT.toString() }
        });
    }

    serverProcess.stdout?.on('data', (data) => console.log(`[Server]: ${data}`));
    serverProcess.stderr?.on('data', (data) => console.error(`[Server Error]: ${data}`));
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 850,
        minWidth: 1024,
        minHeight: 700,
        title: 'ATSIT Finanzas',
        icon: path.join(__dirname, 'public', 'brand', 'icon.ico'),
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    const serverUrl = `http://localhost:${PORT}`;

    checkServerReady(serverUrl, () => {
        mainWindow.loadURL(serverUrl);
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.whenReady().then(() => {
    startNextServer();
    createWindow();
});

app.on('window-all-closed', () => {
    if (serverProcess) {
        if (process.platform === 'win32') {
            spawn('taskkill', ['/pid', serverProcess.pid, '/f', '/t']);
        } else {
            serverProcess.kill('SIGTERM');
        }
    }
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
