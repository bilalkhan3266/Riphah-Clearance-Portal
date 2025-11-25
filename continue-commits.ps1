# Continue adding commits excluding node_modules
$files = @()

# Get faculty-clearance-system files recursively, excluding node_modules
$facultyFiles = Get-ChildItem -Path "faculty-clearance-system" -File -Recurse | 
    Where-Object {$_.FullName -notmatch '\\node_modules\\'} | 
    Sort-Object LastWriteTime
$files += $facultyFiles

Write-Host "Remaining files to commit (excluding node_modules): $($files.Count)"

$commitCount = 0
$startCount = 44

foreach ($file in $files) {
    $relativePath = $file.FullName -replace [regex]::Escape("$PWD\"), ""
    
    # Skip if already committed
    $gitLsOutput = git ls-files "$relativePath" 2>$null
    if ($gitLsOutput) {
        continue
    }
    
    # Add the file
    git add "$relativePath" 2>$null
    
    if ($LASTEXITCODE -eq 0) {
        $fileDate = $file.LastWriteTime
        $formattedDate = $fileDate.ToString("yyyy-MM-dd HH:mm:ss")
        
        # Create commit message
        $commitMsg = ""
        if ($relativePath -match "\.md$|\.txt$") {
            $commitMsg = "docs: $($file.Name)"
        } elseif ($relativePath -match "backend/models") {
            $commitMsg = "feat(db): model - $($file.Name)"
        } elseif ($relativePath -match "backend/routes") {
            $commitMsg = "feat(api): route - $($file.Name)"
        } elseif ($relativePath -match "backend/controllers") {
            $commitMsg = "feat(ctrl): $($file.Name)"
        } elseif ($relativePath -match "backend/services") {
            $commitMsg = "feat(svc): $($file.Name)"
        } elseif ($relativePath -match "backend/middleware") {
            $commitMsg = "feat(mid): $($file.Name)"
        } elseif ($relativePath -match "backend/utils") {
            $commitMsg = "feat(util): $($file.Name)"
        } elseif ($relativePath -match "backend/departments") {
            $commitMsg = "feat(dept): $($file.Name)"
        } elseif ($relativePath -match "backend/scripts") {
            $commitMsg = "chore(script): $($file.Name)"
        } elseif ($relativePath -match "backend/modules") {
            $commitMsg = "feat(mod): $($file.Name)"
        } elseif ($relativePath -match "backend/certificates") {
            $commitMsg = "chore(cert): $($file.Name)"
        } elseif ($relativePath -match "frontend/src") {
            $commitMsg = "ui: component - $($file.Name)"
        } elseif ($relativePath -match "frontend/public") {
            $commitMsg = "assets: $($file.Name)"
        } elseif ($relativePath -match "frontend/build") {
            $commitMsg = "build: $($file.Name)"
        } elseif ($relativePath -match "\.ps1$") {
            $commitMsg = "test: $($file.Name)"
        } elseif ($relativePath -match "package\.json") {
            $commitMsg = "chore: $($file.Name)"
        } else {
            $commitMsg = "chore: add $($file.Name)"
        }
        
        # Commit with date
        git commit -m "$commitMsg" --date "$formattedDate" 2>$null
        
        if ($LASTEXITCODE -eq 0) {
            $commitCount++
            $totalCommits = $startCount + $commitCount
            Write-Host "[$totalCommits] $commitMsg ($formattedDate)"
            
            if ($totalCommits -ge 110) {
                Write-Host "`nReached 110+ commits, stopping..."
                break
            }
        }
    }
}

Write-Host "`n✓ Created $commitCount new commits"
$total = $(git log --oneline | Measure-Object -Line).Lines
Write-Host "✓ Total commits in repository: $total"
Write-Host "`nLast 10 commits:"
git log --oneline -n 10
