// Simple fs utilities for tests
const fs = require('fs');
const path = require('path');

function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

function removeDir(dir) {
    if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true });
    }
}

function writeJson(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

function readJson(filePath) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

// Make async versions that return promises for compatibility
const fsExtra = {
    mkdtemp: (prefix) => Promise.resolve(fs.mkdtempSync(prefix)),
    writeJson: (filePath, data) => Promise.resolve(writeJson(filePath, data)),
    writeFile: (filePath, data, encoding) => Promise.resolve(fs.writeFileSync(filePath, data, encoding || 'utf8')),
    readFile: (filePath, encoding) => Promise.resolve(fs.readFileSync(filePath, encoding || 'utf8')),
    readJson: (filePath) => Promise.resolve(readJson(filePath)),
    ensureDir: (dir) => Promise.resolve(ensureDir(dir)),
    remove: (dir) => Promise.resolve(removeDir(dir)),
    pathExists: (filePath) => Promise.resolve(fs.existsSync(filePath)),

    // Sync versions
    mkdtempSync: fs.mkdtempSync.bind(fs),
    writeJsonSync: writeJson,
    readJsonSync: readJson,
    ensureDirSync: ensureDir,
    removeSync: removeDir,
    pathExistsSync: fs.existsSync.bind(fs)
};

module.exports = fsExtra;
