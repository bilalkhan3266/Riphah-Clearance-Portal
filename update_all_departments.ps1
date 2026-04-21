$files = @(
    @{path='g:\FYP2\faculty-clearance-system\frontend\src\components\Departments\Phase1\Pharmacy\PharmacyClearanceEnhanced.js'; dept='Pharmacy'},
    @{path='g:\FYP2\faculty-clearance-system\frontend\src\components\Departments\Phase2\Finance\FinanceClearanceEnhanced.js'; dept='Finance'},
    @{path='g:\FYP2\faculty-clearance-system\frontend\src\components\Departments\Phase2\HR\HRClearanceEnhanced.js'; dept='HR'},
    @{path='g:\FYP2\faculty-clearance-system\frontend\src\components\Departments\Phase2\Records\RecordsClearanceEnhanced.js'; dept='Records'},
    @{path='g:\FYP2\faculty-clearance-system\frontend\src\components\Departments\Phase3\IT\ITClearanceEnhanced.js'; dept='IT'},
    @{path='g:\FYP2\faculty-clearance-system\frontend\src\components\Departments\Phase3\ORIC\ORICClearanceEnhanced.js'; dept='ORIC'},
    @{path='g:\FYP2\faculty-clearance-system\frontend\src\components\Departments\Phase3\Admin\AdminClearanceEnhanced.js'; dept='Admin'},
    @{path='g:\FYP2\faculty-clearance-system\frontend\src\components\Departments\Phase4\Warden\WardenClearanceEnhanced.js'; dept='Warden'},
    @{path='g:\FYP2\faculty-clearance-system\frontend\src\components\Departments\Phase4\HOD\HODClearanceEnhanced.js'; dept='HOD'},
    @{path='g:\FYP2\faculty-clearance-system\frontend\src\components\Departments\Phase4\Dean\DeanClearanceEnhanced.js'; dept='Dean'}
)

Write-Host "Starting updates for 10 remaining departments..."
$updated = 0

foreach ($file in $files) {
    if (Test-Path $file.path) {
        Write-Host "Processing $($file.dept)..." -ForegroundColor Cyan
        $updated++
    } else {
        Write-Host "❌ File not found: $($file.path)" -ForegroundColor Red
    }
}

Write-Host "`nSummary: Found $updated files" -ForegroundColor Green
