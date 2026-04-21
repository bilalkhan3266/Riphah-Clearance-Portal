#!/usr/bin/env python3
import os
import re

def read_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

def write_file(path, content):
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

def update_department_file(file_path, department_name):
    """Update a department clearance file with required changes"""
    try:
        content = read_file(file_path)
        original = content
        
        # 1. Remove remarks state declaration
        content = re.sub(
            r'  // Clearance remarks\n  const \[remarks, setRemarks\] = useState\(\'\'\);\n',
            '',
            content
        )
        
        # 2. Add Issue/Return Form states after departmentReturns (if not already present)
        if 'showIssueForm' not in content:
            forms_state = """
  // Issue/Return Forms
  const [showIssueForm, setShowIssueForm] = useState(false);
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [issueFormData, setIssueFormData] = useState({
    facultyId: '',
    facultyName: '',
    itemType: 'book',
    description: '',
    quantity: 1,
    dueDate: '',
    notes: ''
  });
  const [returnFormData, setReturnFormData] = useState({
    facultyId: '',
    referenceIssueId: '',
    quantityReturned: 1,
    condition: 'Good',
    notes: ''
  });"""
            content = re.sub(
                r'(  const \[departmentReturns, setDepartmentReturns\] = useState\(\[\]\);)',
                r'\1' + forms_state,
                content
            )
        
        # 3. Remove handleApproveClearance function
        content = re.sub(
            r'  const handleApproveClearance = async \(\) => \{[\s\S]*?^\  \};',
            '',
            content,
            flags=re.MULTILINE
        )
        
        # 4. Remove handleRejectClearance function  
        content = re.sub(
            r'  const handleRejectClearance = async \(\) => \{[\s\S]*?^\  \};',
            '',
            content,
            flags=re.MULTILINE
        )
        
        # 5. Remove setRemarks from handleSelectFaculty
        content = re.sub(
            r',\n    setRemarks\(\'\'\);',
            ';',
            content
        )
        
        if content != original:
            write_file(file_path, content)
            return True, "Updated successfully"
        else:
            return False, "No changes needed"
            
    except Exception as e:
        return False, f"Error: {str(e)}"

# Update all files
files = [
    'g:\\FYP2\\faculty-clearance-system\\frontend\\src\\components\\Departments\\Phase1\\Library\\LibraryClearanceEnhanced.js',
    'g:\\FYP2\\faculty-clearance-system\\frontend\\src\\components\\Departments\\Phase1\\Pharmacy\\PharmacyClearanceEnhanced.js',
    'g:\\FYP2\\faculty-clearance-system\\frontend\\src\\components\\Departments\\Phase2\\Finance\\FinanceClearanceEnhanced.js',
    'g:\\FYP2\\faculty-clearance-system\\frontend\\src\\components\\Departments\\Phase2\\HR\\HRClearanceEnhanced.js',
    'g:\\FYP2\\faculty-clearance-system\\frontend\\src\\components\\Departments\\Phase2\\Records\\RecordsClearanceEnhanced.js',
    'g:\\FYP2\\faculty-clearance-system\\frontend\\src\\components\\Departments\\Phase3\\IT\\ITClearanceEnhanced.js',
    'g:\\FYP2\\faculty-clearance-system\\frontend\\src\\components\\Departments\\Phase3\\ORIC\\ORICClearanceEnhanced.js',
    'g:\\FYP2\\faculty-clearance-system\\frontend\\src\\components\\Departments\\Phase3\\Admin\\AdminClearanceEnhanced.js',
    'g:\\FYP2\\faculty-clearance-system\\frontend\\src\\components\\Departments\\Phase4\\Warden\\WardenClearanceEnhanced.js',
    'g:\\FYP2\\faculty-clearance-system\\frontend\\src\\components\\Departments\\Phase4\\HOD\\HODClearanceEnhanced.js',
    'g:\\FYP2\\faculty-clearance-system\\frontend\\src\\components\\Departments\\Phase4\\Dean\\DeanClearanceEnhanced.js',
]

print("Starting updates...\n")
updated = 0
failed = 0

for f_path in files:
    dept_name = f_path.split('\\')[-2]
    success, msg = update_department_file(f_path, dept_name)
    status = "✅" if success else "⚠️"
    print(f"{status} {dept_name}: {msg}")
    if success:
        updated += 1
    else:
        failed += 1

print(f"\n\nSummary: {updated} updated, {failed} failed")
