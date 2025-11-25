# Distributed commits based on actual file modification dates
$files = @()

# Get all files with their modification dates, excluding node_modules
$allFiles = Get-ChildItem -Path . -File -Recurse | 
    Where-Object {$_.FullName -notmatch '\\node_modules\\|\.git'} | 
    Sort-Object LastWriteTime

$files += $allFiles

Write-Host "Creating 111 commits distributed across actual file dates..."
Write-Host "Total files: $($files.Count)"

$commitCount = 0

foreach ($file in $files) {
    $relativePath = $file.FullName -replace [regex]::Escape("$PWD\"), ""
    
    # Check if already tracked
    $gitStatus = git status "$relativePath" 2>$null
    if ($gitStatus -match "On branch") {
        continue
    }
    
    # Add the file
    git add "$relativePath" 2>$null
    
    if ($LASTEXITCODE -eq 0) {
        $fileDate = $file.LastWriteTime
        $formattedDate = $fileDate.ToString("yyyy-MM-dd HH:mm:ss")
        $gitDate = $fileDate.ToString("ddd MMM d HH:mm:ss yyyy +0500")
        
        # Determine commit type based on file
        $commitMsg = ""
        if ($relativePath -match "\.md$|\.txt$") {
            $fileType = ($relativePath -split '/')[-1]
            $commitMsg = "docs: add documentation - $fileType"
        } elseif ($relativePath -match "backend/models/") {
            $commitMsg = "feat(db): add model - $(($relativePath -split '/')[-1])"
        } elseif ($relativePath -match "backend/routes/") {
            $commitMsg = "feat(api): add route - $(($relativePath -split '/')[-1])"
        } elseif ($relativePath -match "backend/controllers/") {
            $commitMsg = "feat(ctrl): add controller - $(($relativePath -split '/')[-1])"
        } elseif ($relativePath -match "backend/services/") {
            $commitMsg = "feat(svc): add service - $(($relativePath -split '/')[-1])"
        } elseif ($relativePath -match "backend/middleware/") {
            $commitMsg = "feat(mid): add middleware - $(($relativePath -split '/')[-1])"
        } elseif ($relativePath -match "backend/") {
            $commitMsg = "chore(backend): $(($relativePath -split '/')[-1])"
        } elseif ($relativePath -match "frontend/src/") {
            $commitMsg = "ui: add component - $(($relativePath -split '/')[-1])"
        } elseif ($relativePath -match "frontend/") {
            $commitMsg = "build(frontend): add asset - $(($relativePath -split '/')[-1])"
        } elseif ($relativePath -match "\.ps1$") {
            $commitMsg = "test: add test script - $(($relativePath -split '/')[-1])"
        } else {
            $commitMsg = "chore: add $(($relativePath -split '/')[-1])"
        }
        
        # Set environment variables for git commit date
        $env:GIT_AUTHOR_DATE = $gitDate
        $env:GIT_COMMITTER_DATE = $gitDate
        
        # Commit with the file's actual modification date
        git commit -m "$commitMsg" --date="$formattedDate" 2>$null
        
        if ($LASTEXITCODE -eq 0) {
            $commitCount++
            $monthDay = $fileDate.ToString("MMM dd")
            $dayName = $fileDate.DayOfWeek
            Write-Host "[$commitCount/111] $commitMsg [$dayName $monthDay]"
            
            if ($commitCount -ge 111) {
                break
            }
        }
    }
}

Write-Host "`n✓ Created $commitCount commits distributed across $(((Get-Date) - $files[0].LastWriteTime).Days) days"
Write-Host "✓ Date range: $($files[0].LastWriteTime.ToString('MMM dd, yyyy')) to $($files[-1].LastWriteTime.ToString('MMM dd, yyyy'))"

$stats = git log --pretty=format:"%ai" | ForEach-Object {[DateTime]::Parse($_)}
Write-Host "`nDate Distribution:`n"
$stats | Group-Object {$_.Date.Month} | ForEach-Object {
    $monthName = [Globalization.CultureInfo]::CurrentCulture.DateTimeFormat.GetMonthName($_.Name)
    Write-Host "  $monthName 2026: $($_.Count) commits"
}

Write-Host "`nLatest commits:`n"
git log --pretty=format:"%ai %h %s" -n 15
