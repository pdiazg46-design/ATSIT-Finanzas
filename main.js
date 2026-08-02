const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');

// Global Uncaught Exception Handlers to prevent system crash dialogs
process.on('uncaughtException', (err) => {
    console.error('[Main Process Uncaught Exception]:', err);
});

process.on('unhandledRejection', (reason) => {
    console.error('[Main Process Unhandled Rejection]:', reason);
});

// Ensure full Windows system environment paths
if (process.platform === 'win32') {
    process.env.SystemRoot = process.env.SystemRoot || 'C:\\Windows';
    process.env.ComSpec = process.env.ComSpec || 'C:\\Windows\\system32\\cmd.exe';
    const sysPath = 'C:\\Windows\\system32;C:\\Windows;C:\\Windows\\System32\\Wbem';
    if (!process.env.PATH) {
        process.env.PATH = sysPath;
    } else if (!process.env.PATH.toLowerCase().includes('system32')) {
        process.env.PATH = `${sysPath};${process.env.PATH}`;
    }
}

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
        const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
        serverProcess = spawn(npmCmd, ['run', 'dev'], {
            cwd: appPath,
            shell: true,
            env: { ...process.env, PORT: PORT.toString() }
        });
        serverProcess.stdout?.on('data', (data) => console.log(`[Dev Server]: ${data}`));
        serverProcess.stderr?.on('data', (data) => console.error(`[Dev Server Error]: ${data}`));
    } else {
        process.env.NODE_ENV = 'production';
        process.env.PORT = PORT.toString();
        process.env.AUTH_SECRET = process.env.AUTH_SECRET || 'atsit-finanzas-secret-key-2026-prod-fallback';
        process.env.NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || 'atsit-finanzas-secret-key-2026-prod-fallback';

        try {
            if (process.platform === 'win32') {
                // Lógica de Windows 100% intacta
                const nextBin = path.join(appPath, 'node_modules', 'next', 'dist', 'bin', 'next');
                serverProcess = spawn(process.execPath, [nextBin, 'start', '-H', '127.0.0.1', '-p', PORT.toString()], {
                    cwd: appPath,
                    windowsHide: true,
                    env: {
                        ...process.env,
                        ELECTRON_RUN_AS_NODE: '1',
                        NODE_ENV: 'production',
                        PORT: PORT.toString()
                    }
                });
                serverProcess.stdout?.on('data', (data) => console.log(`[Server]: ${data}`));
                serverProcess.stderr?.on('data', (data) => console.error(`[Server Error]: ${data}`));
            } else {
                // Lógica específica para macOS / Linux (usa fork para ejecutar el binario de Next.js sin bloqueo de SIP)
                let unpackedAppPath = appPath;
                if (appPath.endsWith('.asar')) {
                    unpackedAppPath = appPath + '.unpacked';
                } else if (appPath.includes('app.asar')) {
                    unpackedAppPath = appPath.replace('app.asar', 'app.asar.unpacked');
                }
                const nextBin = path.join(unpackedAppPath, 'node_modules', 'next', 'dist', 'bin', 'next');

                const { fork } = require('child_process');
                serverProcess = fork(nextBin, ['start', '-H', '127.0.0.1', '-p', PORT.toString()], {
                    cwd: unpackedAppPath,
                    env: {
                        ...process.env,
                        ELECTRON_RUN_AS_NODE: '1',
                        NODE_ENV: 'production',
                        PORT: PORT.toString()
                    }
                });
                serverProcess.stdout?.on('data', (data) => console.log(`[macOS Server]: ${data}`));
                serverProcess.stderr?.on('data', (data) => console.error(`[macOS Server Error]: ${data}`));
            }
        } catch (err) {
            console.error('[Next.js Start Error]:', err);
        }
    }
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
        icon: path.join(appPath, 'public', 'brand', 'icon.ico'),
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

    const serverUrl = `http://127.0.0.1:${PORT}`;

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
        if (typeof serverProcess.close === 'function') {
            serverProcess.close();
        } else if (serverProcess.pid) {
            if (process.platform === 'win32') {
                try {
                    spawn('taskkill', ['/pid', serverProcess.pid, '/f', '/t'], { windowsHide: true });
                } catch (e) {}
            } else {
                serverProcess.kill('SIGTERM');
            }
        }
    }
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
