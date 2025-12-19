/**
 * Lab Department - Issue Model
 * Tracks items issued to faculty by Lab
 */

const mongoose = require('mongoose');
const IssueSchema = require('../../models/Issue').schema;

const LabIssueSchema = IssueSchema.discriminator(
  'Lab',
  new mongoose.Schema({
    equipmentLocation: String,
    projectCode: String,
    labManagerApproval: {
      approved: Boolean,
      approvalDate: Date,
      approvalNotes: String
    }
  })
);

module.exports = mongoose.model('LabIssue', LabIssueSchema, 'issues');
