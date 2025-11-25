# Get all files to commit
$files = @()
$rootFiles = Get-ChildItem -Path . -File | Where-Object {$_.Name -notmatch '\.git'} | Sort-Object LastWriteTime
$files += $rootFiles

# Get faculty-clearance-system files recursively
$facultyFiles = Get-ChildItem -Path "faculty-clearance-system" -File -Recurse | Sort-Object LastWriteTime
$files += $facultyFiles

Write-Host "Total files to commit: $($files.Count)"

$commitCount = 0

foreach ($file in $files) {
    $relativePath = $file.FullName -replace [regex]::Escape("$PWD\"), ""
    
    # Add the file
    git add "$relativePath" 2>$null
    
    if ($LASTEXITCODE -eq 0) {
        # Get the file's last write time
        $fileDate = $file.LastWriteTime
        $gitDate = $fileDate.ToString("ddd MMM d HH:mm:ss yyyy zzz").Replace("+", "\+")
        $formattedDate = $fileDate.ToString("yyyy-MM-dd HH:mm:ss")
        
        # Create commit message based on file type
        $commitMsg = ""
        if ($relativePath -match "\.md$|\.txt$") {
            $commitMsg = "docs: add $($file.Name)"
        } elseif ($relativePath -match "backend/models") {
            $commitMsg = "feat: add database model - $($file.Name)"
        } elseif ($relativePath -match "backend/routes") {
            $commitMsg = "feat: add API route - $($file.Name)"
        } elseif ($relativePath -match "backend/controllers") {
            $commitMsg = "feat: add controller - $($file.Name)"
        } elseif ($relativePath -match "backend/services") {
            $commitMsg = "feat: add service - $($file.Name)"
        } elseif ($relativePath -match "backend/middleware") {
            $commitMsg = "feat: add middleware - $($file.Name)"
        } elseif ($relativePath -match "backend/utils") {
            $commitMsg = "feat: add utility - $($file.Name)"
        } elseif ($relativePath -match "backend/departments") {
            $commitMsg = "feat: add department module - $($file.Name)"
        } elseif ($relativePath -match "frontend/src") {
            $commitMsg = "ui: add React component - $($file.Name)"
        } elseif ($relativePath -match "frontend/public") {
            $commitMsg = "assets: add frontend asset - $($file.Name)"
        } elseif ($relativePath -match "\.ps1$") {
            $commitMsg = "test: add test script - $($file.Name)"
        } elseif ($relativePath -match "\.js$") {
            $commitMsg = "chore: add utility - $($file.Name)"
        } elseif ($relativePath -match "package\.json|package-lock\.json") {
            $commitMsg = "chore: update dependencies - $($file.Name)"
        } else {
            $commitMsg = "chore: add $($file.Name)"
        }
        
        # Commit with the file's modification date
        $env:GIT_AUTHOR_DATE = $gitDate
        $env:GIT_COMMITTER_DATE = $gitDate
        git commit -m "$commitMsg" --date "$formattedDate" 2>$null
        
        if ($LASTEXITCODE -eq 0) {
            $commitCount++
            Write-Host "[$commitCount] Committed: $relativePath ($formattedDate)"
        }
    }
}

Write-Host "`nTotal commits created: $commitCount"
git log --oneline -n 20
