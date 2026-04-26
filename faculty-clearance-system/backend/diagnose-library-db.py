#!/usr/bin/env python3
"""
Direct MongoDB Query Test
Tests what data is actually in the database for Library department
"""

from pymongo import MongoClient
import json
from datetime import datetime

# Connect to MongoDB
client = MongoClient('mongodb://localhost:27017/')
db = client['faculty-clearance']
issues_collection = db['issues']

print("\n" + "="*70)
print("  LIBRARY DEPARTMENT DATA VERIFICATION")
print("="*70 + "\n")

# Query 1: All Library issues
print("📋 Query 1: All Library Issues")
print("-" * 70)

library_issues = list(issues_collection.find({"departmentName": "Library"}).limit(5))
total_library = issues_collection.count_documents({"departmentName": "Library"})

print(f"✅ Total Library Issues: {total_library}")
print(f"✅ Sampling First 5:\n")

for idx, issue in enumerate(library_issues, 1):
    print(f"\nIssue {idx}:")
    print(f"  Faculty ID: {issue.get('facultyId', 'N/A')}")
    print(f"  Item Type: {issue.get('itemType', 'N/A')}")
    print(f"  Description: {issue.get('description', 'N/A')}")
    print(f"  Status: {issue.get('status', 'N/A')}")
    print(f"  Quantity: {issue.get('quantity', 'N/A')}")
    print(f"  Issue Date: {issue.get('issueDate', 'N/A')}")

# Query 2: Status breakdown
print("\n\n📊 Query 2: Status Breakdown for Library")
print("-" * 70)

status_breakdown = issues_collection.aggregate([
    {"$match": {"departmentName": "Library"}},
    {"$group": {"_id": "$status", "count": {"$sum": 1}}}
])

status_counts = {item['_id']: item['count'] for item in status_breakdown}
print(f"\nStatus Distribution:")
for status, count in sorted(status_counts.items()):
    print(f"  {status}: {count} issues")

total_by_status = sum(status_counts.values())
print(f"\n  Total: {total_by_status} issues")

# Query 3: Check all possible fields
print("\n\n🔍 Query 3: Check All Fields in Sample Issue")
print("-" * 70)

sample = issues_collection.find_one({"departmentName": "Library"})
if sample:
    print(f"\nSample Issue Fields:")
    for key, value in sample.items():
        if key == '_id':
            print(f"  {key}: {str(value)[:50]}...")
        else:
            print(f"  {key}: {value}")

# Query 4: Check faculty IDs
print("\n\n👥 Query 4: Faculty Distribution")
print("-" * 70)

faculty_distribution = issues_collection.aggregate([
    {"$match": {"departmentName": "Library"}},
    {"$group": {"_id": "$facultyId", "count": {"$sum": 1}}}
])

faculty_list = list(faculty_distribution)
print(f"\nTotal Faculty: {len(faculty_list)}")
print(f"Sample Faculty (first 10):")
for item in faculty_list[:10]:
    print(f"  Faculty {item['_id']}: {item['count']} items")

# Query 5: Direct Count
print("\n\n📝 Query 5: Direct Count Verification")
print("-" * 70)

all_issues = issues_collection.find({"departmentName": "Library"})
manual_count = 0
for _ in all_issues:
    manual_count += 1

print(f"\nDirect Cursor Count: {manual_count}")

# Summary
print("\n" + "="*70)
print("  SUMMARY")
print("="*70)
print(f"\n✅ Total Library Issues in Database: {total_library}")
print(f"✅ Status Breakdown: {status_counts}")
print(f"\n📊 If showing '0 pending':")
print(f"   - Database HAS the data: {total_library} issues")
print(f"   - Check frontend filtering/status matching")
print(f"   - Most issues are: {max(status_counts.items())[0] if status_counts else 'N/A'}")
print("\n" + "="*70 + "\n")

client.close()
