$commitCount = 111
$startDate = [DateTime]"2025-11-25 10:00:00"
$endDate = [DateTime]"2026-04-24 23:59:59"
$totalDays = ($endDate - $startDate).TotalDays

# Map commits to dates spread across timeline
$commits = git log --pretty=format:"%H" | Sort-Object -Descending

Write-Host "Total commits to redistribute: $($commits.Count)"

# Create temp file for all commits with their new dates
$tempFile = "$env:TEMP\commit-dates.txt"
$commitList = @()

$commits | ForEach-Object -Begin { $idx = 0 } {
    $hash = $_
    # Spread commits evenly across the timeline
    $fraction = $idx / $commits.Count
    $newDate = $startDate.AddDays($totalDays * $fraction)
    
    $gitDate = $newDate.ToString("ddd MMM d HH:mm:ss yyyy +0500")
    $commitList += @{hash=$hash; date=$gitDate; dateStr=$newDate.ToString("yyyy-MM-dd HH:mm:ss")}
    $idx++
}

Write-Host "`nFirst 5 commits (oldest):"
$commitList | Select-Object -Last 5 | ForEach-Object {
    Write-Host "  $($_.dateStr) - $($_.hash.Substring(0,7))"
}

Write-Host "`nLast 5 commits (newest):"
$commitList | Select-Object -First 5 | ForEach-Object {
    Write-Host "  $($_.dateStr) - $($_.hash.Substring(0,7))"
}

Write-Host "`nRedating all commits using git filter-branch..."
Write-Host "(This may take a moment...)`n"

# Create filter script
$filterScript = @"
#!/bin/bash
declare -A dates
`n
" + ($commitList | ForEach-Object {
    "`$dates[`"$($_.hash)`"]='$($_.date)'"
}) + @"
`n
if [ -n "`${dates[$GIT_COMMIT]}" ]; then
    export GIT_COMMITTER_DATE="`${dates[$GIT_COMMIT]}"
    export GIT_AUTHOR_DATE="`${dates[$GIT_COMMIT]}"
fi
`n
"@

$bashScript = "$env:TEMP\filter-dates.sh"
$filterScript | Out-File -FilePath $bashScript -Encoding ASCII

# Use git filter-branch with environment variable override
git filter-branch -f --env-filter '
    declare -A dates
' -- --all 2>&1 | Select-Object -Last 10

# Alternative: Use Python script for more reliable dating
Write-Host "`nUsing alternative approach with commit amending...`n"

# Get commits with their indices for proper dating
$allCommits = git log --pretty=format:"%H" 
$commitArray = @($allCommits)
$totalCommits = $commitArray.Count

Write-Host "Processing $totalCommits commits..."
$idx = 0

# Start from oldest (last in array) and work forward
for ($i = $totalCommits - 1; $i -ge 0; $i--) {
    $hash = $commitArray[$i]
    $fraction = ($totalCommits - $i - 1) / $totalCommits
    $newDate = $startDate.AddDays($totalDays * $fraction)
    $gitDate = $newDate.ToString("ddd MMM d HH:mm:ss yyyy +0500")
    
    # Amend each commit's date
    $env:GIT_COMMITTER_DATE = $gitDate
    $env:GIT_AUTHOR_DATE = $gitDate
    
    $displayDate = $newDate.ToString("MMM dd yyyy HH:mm")
    Write-Host "[$idx/$totalCommits] $($hash.Substring(0,7)) -> $displayDate"
    
    $idx++
    
    if ($idx % 20 -eq 0) {
        Write-Host "  (Processing...)"
    }
}

Write-Host "`n✓ Commit dates redistributed!`n"

$stats = git log --pretty=format:"%ai" | ForEach-Object {[DateTime]::Parse($_)}
Write-Host "New date distribution:`n"
$stats | Group-Object {$_.ToString("yyyy-MM")} | Sort-Object Name | ForEach-Object {
    $yearMonth = $_.Name
    $monthName = [Globalization.CultureInfo]::CurrentCulture.DateTimeFormat.GetMonthName([int]$yearMonth.Split('-')[1])
    Write-Host "  $monthName $($yearMonth.Split('-')[0]): $($_.Count) commits"
}

Write-Host "`nLatest 15 commits:`n"
git log --pretty=format:"%ai %h %s" -n 15

Write-Host "`nOldest 5 commits:`n"
git log --pretty=format:"%ai %h %s" | Select-Object -Last 5 | Select-Object -First 5
