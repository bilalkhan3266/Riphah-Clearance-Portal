const mongoose = require('mongoose');
const IssueSchema = require('../../models/Issue').schema;
module.exports = mongoose.model('PharmacyIssue', IssueSchema.discriminator('Pharmacy', new mongoose.Schema({medicineType: String})), 'issues');