const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');

let mainWindow;
let serverProcess;
const PORT = 3000;

// Force High-DPI crisp rendering
app.commandLine.appendSwitch('high-dpi-support', '1');

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
    const appPath = isDev ? __dirname : app.getAppPath();

    if (isDev) {
        serverProcess = spawn('npm.cmd', ['run', 'dev'], {
            cwd: appPath,
            shell: true,
            env: { ...process.env, PORT: PORT.toString() }
        });
    } else {
        const nextBin = path.join(appPath, 'node_modules', 'next', 'dist', 'bin', 'next');
        serverProcess = spawn(process.execPath, [nextBin, 'start', '-H', '0.0.0.0', '-p', PORT.toString()], {
            cwd: appPath,
            env: {
                ...process.env,
                ELECTRON_RUN_AS_NODE: '1',
                NODE_ENV: 'production',
                PORT: PORT.toString(),
                AUTH_SECRET: process.env.AUTH_SECRET || 'atsit-finanzas-secret-key-2026-prod-fallback',
                NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'atsit-finanzas-secret-key-2026-prod-fallback'
            }
        });
    }

    serverProcess.stdout?.on('data', (data) => console.log(`[Server]: ${data}`));
    serverProcess.stderr?.on('data', (data) => console.error(`[Server Error]: ${data}`));
}

function createWindow() {
    const isDev = !app.isPackaged;
    const appPath = isDev ? __dirname : app.getAppPath();

    mainWindow = new BrowserWindow({
        width: 1280,
        height: 850,
        minWidth: 1024,
        minHeight: 700,
        title: 'ATSIT Finanzas',
        icon: path.join(appPath, 'public', 'logo.png'),
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            zoomFactor: 0.85
        }
    });

    // Enable Zoom Shortcuts: Ctrl + +, Ctrl + -, Ctrl + 0
    mainWindow.webContents.on('before-input-event', (event, input) => {
        if (input.control || input.meta) {
            if (input.key === '+' || input.key === '=') {
                const currentZoom = mainWindow.webContents.getZoomFactor();
                mainWindow.webContents.setZoomFactor(Math.min(currentZoom + 0.1, 2.0));
                event.preventDefault();
            } else if (input.key === '-') {
                const currentZoom = mainWindow.webContents.getZoomFactor();
                mainWindow.webContents.setZoomFactor(Math.max(currentZoom - 0.1, 0.5));
                event.preventDefault();
            } else if (input.key === '0') {
                mainWindow.webContents.setZoomFactor(0.85);
                event.preventDefault();
            }
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
