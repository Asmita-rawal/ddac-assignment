const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Check if file exists
function fileExists(filePath) {
    try {
        return fs.existsSync(filePath);
    } catch {
        return false;
    }
}

// Get file size
function getFileSize(filePath) {
    try {
        const stats = fs.statSync(filePath);
        return stats.size;
    } catch {
        return 0;
    }
}

// Get file extension
function getFileExtension(filePath) {
    return path.extname(filePath).toLowerCase();
}

// Get file name without extension
function getFileNameWithoutExt(filePath) {
    return path.basename(filePath, path.extname(filePath));
}

// Get file MIME type
function getMimeType(filePath) {
    const ext = getFileExtension(filePath);
    const mimeTypes = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.svg': 'image/svg+xml',
        '.pdf': 'application/pdf',
        '.doc': 'application/msword',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.xls': 'application/vnd.ms-excel',
        '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        '.txt': 'text/plain',
        '.csv': 'text/csv',
        '.json': 'application/json',
        '.xml': 'application/xml',
        '.zip': 'application/zip',
        '.mp4': 'video/mp4',
        '.mp3': 'audio/mpeg'
    };
    return mimeTypes[ext] || 'application/octet-stream';
}

// Generate unique filename
function generateUniqueFilename(originalName) {
    const ext = path.extname(originalName);
    const name = path.basename(originalName, ext);
    const timestamp = Date.now();
    const random = crypto.randomBytes(8).toString('hex');
    const sanitizedName = name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
    return `${sanitizedName}-${timestamp}-${random}${ext}`;
}

// Ensure directory exists
function ensureDirectory(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

// Delete file
function deleteFile(filePath) {
    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            return true;
        }
        return false;
    } catch (error) {
        console.error('Delete file error:', error);
        return false;
    }
}

// Delete multiple files
function deleteFiles(filePaths) {
    const results = [];
    for (const filePath of filePaths) {
        results.push(deleteFile(filePath));
    }
    return results;
}

// Move file
function moveFile(sourcePath, destinationPath) {
    try {
        ensureDirectory(path.dirname(destinationPath));
        fs.renameSync(sourcePath, destinationPath);
        return true;
    } catch (error) {
        console.error('Move file error:', error);
        return false;
    }
}

// Copy file
function copyFile(sourcePath, destinationPath) {
    try {
        ensureDirectory(path.dirname(destinationPath));
        fs.copyFileSync(sourcePath, destinationPath);
        return true;
    } catch (error) {
        console.error('Copy file error:', error);
        return false;
    }
}

// Read file as string
function readFileString(filePath) {
    try {
        return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
        console.error('Read file error:', error);
        return null;
    }
}

// Read file as buffer
function readFileBuffer(filePath) {
    try {
        return fs.readFileSync(filePath);
    } catch (error) {
        console.error('Read file error:', error);
        return null;
    }
}

// Write file
function writeFile(filePath, data) {
    try {
        ensureDirectory(path.dirname(filePath));
        fs.writeFileSync(filePath, data);
        return true;
    } catch (error) {
        console.error('Write file error:', error);
        return false;
    }
}

// Get file stats
function getFileStats(filePath) {
    try {
        return fs.statSync(filePath);
    } catch (error) {
        console.error('Get file stats error:', error);
        return null;
    }
}

// List files in directory
function listFiles(dirPath, filter = null) {
    try {
        let files = fs.readdirSync(dirPath);
        if (filter) {
            files = files.filter(filter);
        }
        return files;
    } catch (error) {
        console.error('List files error:', error);
        return [];
    }
}

// Get directory size
function getDirectorySize(dirPath) {
    try {
        let totalSize = 0;
        const files = fs.readdirSync(dirPath);
        for (const file of files) {
            const filePath = path.join(dirPath, file);
            const stats = fs.statSync(filePath);
            if (stats.isDirectory()) {
                totalSize += getDirectorySize(filePath);
            } else {
                totalSize += stats.size;
            }
        }
        return totalSize;
    } catch (error) {
        console.error('Get directory size error:', error);
        return 0;
    }
}

// Clean directory (remove old files)
function cleanDirectory(dirPath, maxAge = 24 * 60 * 60 * 1000) {
    try {
        const files = fs.readdirSync(dirPath);
        const now = Date.now();
        let deleted = 0;
        
        for (const file of files) {
            const filePath = path.join(dirPath, file);
            const stats = fs.statSync(filePath);
            if (stats.isFile() && (now - stats.mtimeMs) > maxAge) {
                fs.unlinkSync(filePath);
                deleted++;
            }
        }
        return deleted;
    } catch (error) {
        console.error('Clean directory error:', error);
        return 0;
    }
}

// Create temporary file
function createTempFile(content, extension = '.txt') {
    const tempDir = path.join(__dirname, '../../uploads/temp');
    ensureDirectory(tempDir);
    const filename = `temp-${Date.now()}-${Math.random().toString(36).substring(7)}${extension}`;
    const filePath = path.join(tempDir, filename);
    writeFile(filePath, content);
    return filePath;
}

// File size formatter
function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const size = (bytes / Math.pow(k, i)).toFixed(2);
    return `${size} ${units[i]}`;
}

// Check if file is image
function isImage(filePath) {
    const extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
    const ext = getFileExtension(filePath);
    return extensions.includes(ext);
}

// Check if file is video
function isVideo(filePath) {
    const extensions = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.mkv', '.webm'];
    const ext = getFileExtension(filePath);
    return extensions.includes(ext);
}

// Check if file is audio
function isAudio(filePath) {
    const extensions = ['.mp3', '.wav', '.aac', '.flac', '.ogg', '.wma'];
    const ext = getFileExtension(filePath);
    return extensions.includes(ext);
}

// Check if file is document
function isDocument(filePath) {
    const extensions = ['.pdf', '.doc', '.docx', '.txt', '.rtf', '.odt'];
    const ext = getFileExtension(filePath);
    return extensions.includes(ext);
}

// Get file hash
function getFileHash(filePath, algorithm = 'md5') {
    try {
        const data = fs.readFileSync(filePath);
        return crypto.createHash(algorithm).update(data).digest('hex');
    } catch (error) {
        console.error('Get file hash error:', error);
        return null;
    }
}

module.exports = {
    fileExists,
    getFileSize,
    getFileExtension,
    getFileNameWithoutExt,
    getMimeType,
    generateUniqueFilename,
    ensureDirectory,
    deleteFile,
    deleteFiles,
    moveFile,
    copyFile,
    readFileString,
    readFileBuffer,
    writeFile,
    getFileStats,
    listFiles,
    getDirectorySize,
    cleanDirectory,
    createTempFile,
    formatFileSize,
    isImage,
    isVideo,
    isAudio,
    isDocument,
    getFileHash
};