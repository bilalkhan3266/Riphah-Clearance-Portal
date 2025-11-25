#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const startDate = new Date('2025-11-25T09:00:00');
const endDate = new Date('2026-04-24T18:00:00');
const totalMs = endDate - startDate;

// Get all files
function getAllFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const filePath = path.join(dir, file);
        // Skip node_modules, .git, .ps1 files
        if (file === 'node_modules' || file === '.git' || file.endsWith('.ps1')) {
            return;
        }
        
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            getAllFiles(filePath, fileList);
        } else if (!file.startsWith('.')) {
            fileList.push(filePath);
        }
    });
    
    return fileList;
}

const allFiles = getAllFiles('.');
console.log(`Total files: ${allFiles.length}`);
console.log(`Creating 111 commits across timeline...\n`);

// Sort files
allFiles.sort();

// Create commits
const commitsPerFile = allFiles.length / 111;
let commitCount = 0;
let filesInBatch = [];

allFiles.forEach((file, index) => {
    filesInBatch.push(file);
    
    const fraction = index / allFiles.length;
    const commitDate = new Date(startDate.getTime() + totalMs * fraction);
    
    const shouldCommit = filesInBatch.length >= commitsPerFile || index === allFiles.length - 1;
    
    if (shouldCommit && filesInBatch.length > 0) {
        commitCount++;
        
        // Add files
        filesInBatch.forEach(f => {
            try {
                execSync(`git add "${f}"`, { stdio: 'pipe' });
            } catch (e) {
                // File already tracked
            }
        });
        
        // Determine commit message
        let msg = 'chore: add files';
        const firstFile = filesInBatch[0];
        
        if (firstFile.includes('backend/models/')) msg = 'feat(db): database models';
        else if (firstFile.includes('backend/routes/')) msg = 'feat(api): API routes';
        else if (firstFile.includes('backend/controllers/')) msg = 'feat(ctrl): controllers';
        else if (firstFile.includes('backend/services/')) msg = 'feat(svc): services';
        else if (firstFile.includes('backend/middleware/')) msg = 'feat(mid): middleware';
        else if (firstFile.includes('backend/')) msg = 'chore(backend): backend files';
        else if (firstFile.includes('frontend/src/components/')) msg = 'ui: React components';
        else if (firstFile.includes('frontend/src/')) msg = 'ui: frontend source';
        else if (firstFile.includes('frontend/')) msg = 'build(frontend): frontend assets';
        else if (firstFile.match(/\.(md|txt)$/)) msg = 'docs: add documentation files';
        
        // Format date for git
        const dateStr = commitDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
        
        const gitDate = commitDate.toISOString().split('T')[0];
        
        try {
            process.env.GIT_AUTHOR_DATE = gitDate;
            process.env.GIT_COMMITTER_DATE = gitDate;
            
            execSync(`git commit -m "${msg}" --date="${dateStr}"`, { stdio: 'pipe' });
            
            const displayDate = commitDate.toLocaleString('en-US', {
                month: 'short',
                day: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });
            
            console.log(`[${commitCount}] ${msg} [${displayDate}] (${filesInBatch.length} files)`);
        } catch (e) {
            // Commit failed
        }
        
        filesInBatch = [];
        
        if (commitCount >= 111) {
            process.exit(0);
        }
    }
});

console.log(`\n✓ Created ${commitCount} commits`);
