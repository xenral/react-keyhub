#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Check if the dist directory exists
if (!fs.existsSync(path.join(process.cwd(), 'dist'))) {
    console.error('Error: dist directory does not exist. Run "npm run build" first.');
    process.exit(1);
}

// Get the size of the dist directory
const getDirectorySize = (dirPath) => {
    const files = fs.readdirSync(dirPath);
    let size = 0;

    for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stats = fs.statSync(filePath);

        if (stats.isDirectory()) {
            size += getDirectorySize(filePath);
        } else {
            size += stats.size;
        }
    }

    return size;
};

const distSize = getDirectorySize(path.join(process.cwd(), 'dist'));
const distSizeKB = (distSize / 1024).toFixed(2);

console.log(`\nPackage size: ${distSizeKB} KB\n`);

// Check individual file sizes
const files = fs.readdirSync(path.join(process.cwd(), 'dist'));
console.log('Individual file sizes:');

for (const file of files) {
    const filePath = path.join(process.cwd(), 'dist', file);
    const stats = fs.statSync(filePath);

    if (!stats.isDirectory()) {
        const fileSizeKB = (stats.size / 1024).toFixed(2);
        console.log(`- ${file}: ${fileSizeKB} KB`);
    }
}

// Check gzipped size
console.log('\nGzipped sizes:');

for (const file of files) {
    const filePath = path.join(process.cwd(), 'dist', file);
    const stats = fs.statSync(filePath);

    if (!stats.isDirectory() && (file.endsWith('.js') || file.endsWith('.mjs'))) {
        try {
            const gzippedSize = execSync(`gzip -c "${filePath}" | wc -c`).toString().trim();
            const gzippedSizeKB = (parseInt(gzippedSize) / 1024).toFixed(2);
            console.log(`- ${file}: ${gzippedSizeKB} KB`);
        } catch (error) {
            console.log(`- ${file}: Could not determine gzipped size`);
        }
    }
}

console.log('\nSize check completed.');

// Check against size limit
const sizeLimit = 10; // 10 KB
const jsFiles = files.filter(file => file.endsWith('.js') && !file.endsWith('.map'));
const gzippedSizes = jsFiles.map(file => {
    try {
        const filePath = path.join(process.cwd(), 'dist', file);
        const gzippedSize = execSync(`gzip -c "${filePath}" | wc -c`).toString().trim();
        return parseInt(gzippedSize);
    } catch (error) {
        return 0;
    }
});

const maxGzippedSize = Math.max(...gzippedSizes);
const maxGzippedSizeKB = (maxGzippedSize / 1024).toFixed(2);

if (maxGzippedSizeKB > sizeLimit) {
    console.warn(`\nWarning: Gzipped package size (${maxGzippedSizeKB} KB) exceeds the limit of ${sizeLimit} KB.`);
} else {
    console.log(`\nSuccess: Gzipped package size (${maxGzippedSizeKB} KB) is within the limit of ${sizeLimit} KB.`);
}