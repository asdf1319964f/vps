const fs = require('fs');
const path = require('path');

const folderPath = 'tvbox';
const outputFilePath = 'out.txt';
const targetExtensions = new Set(['.js', '.json']);

let fileRecords = {};

function processFolder(folderPath, relativePath = '') {
    fs.readdir(folderPath, { withFileTypes: true }, (err, files) => {
        if (err) {
            console.error('Error reading folder:', err);
            return;
        }

        files.forEach(file => {
            const filePath = path.join(folderPath, file.name);
            const fileRelativePath = path.join(relativePath, file.name);

            if (file.isDirectory()) {
                processFolder(filePath, fileRelativePath);
            } else {
                const fileExtension = path.extname(file.name);
                if (targetExtensions.has(fileExtension)) {
                    const fileName = path.basename(file.name, fileExtension);
                    if (!fileRecords[fileName]) {
                        fileRecords[fileName] = [];
                    }
                    fileRecords[fileName].push(fileRelativePath);
                }
            }
        });
    });
}

function findAndLogDuplicates() {
    const duplicates = {};

    for (const [fileName, paths] of Object.entries(fileRecords)) {
        if (paths.length > 1) {
            duplicates[fileName] = paths;
        }
    }

    const logStream = fs.createWriteStream(outputFilePath, { flags: 'w' });
    logStream.write('Duplicate Files Found:\n\n');
    
    for (const [fileName, paths] of Object.entries(duplicates)) {
        logStream.write(`File: ${fileName}\n`);
        paths.forEach(filePath => {
            logStream.write(`  - ${filePath}\n`);
        });
        logStream.write('\n');
    }

    logStream.end(() => {
        console.log(`Duplicate files logged in ${outputFilePath}`);
    });
}

function main() {
    processFolder(folderPath);
    setTimeout(findAndLogDuplicates, 1000); // Add a small delay to ensure all file processing completes
}

main();
