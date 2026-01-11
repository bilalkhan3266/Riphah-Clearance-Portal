/**
 * Lab Department - Return Model
 * Tracks items returned by faculty to Lab
 */

const mongoose = require('mongoose');
const ReturnSchema = require('../../models/Return').schema;

const LabReturnSchema = ReturnSchema.discriminator(
  'Lab',
  new mongoose.Schema({
    equipmentConditionReport: String,
    calibrationRequired: Boolean,
    maintenanceNotes: String,
    safetyCheckPassed: Boolean,
    safetyCheckDate: Date
  })
);

module.exports = mongoose.model('LabReturn', LabReturnSchema, 'returns');
