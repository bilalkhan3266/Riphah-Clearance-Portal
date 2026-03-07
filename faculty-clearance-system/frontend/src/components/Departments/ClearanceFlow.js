import React, { useState, useEffect } from 'react';
import { MdCheckCircle, MdCancel, MdEmojiEvents, MdHourglassEmpty, MdAssignment, MdMenuBook, MdScience, MdLocalPharmacy, MdWork, MdAccountBalance, MdComputer, MdBiotech, MdHome, MdSupervisorAccount, MdSchool } from 'react-icons/md';
import './ClearanceFlow.css';

// Import all department components
import LibraryClearance from './Phase1/Library/LibraryClearance';
import LabClearance from './Phase1/Lab/LabClearance';
import PharmacyClearance from './Phase1/Pharmacy/PharmacyClearance';
import HRClearance from './Phase2/HR/HRClearance';
import FinanceClearance from './Phase2/Finance/FinanceClearance';
import RecordsClearance from './Phase2/Records/RecordsClearance';
import ITClearance from './Phase3/IT/ITClearance';
import AdminClearance from './Phase3/Admin/AdminClearance';
import ORICClearance from './Phase3/ORIC/ORICClearance';
import WardenClearance from './Phase4/Warden/WardenClearance';
import HODClearance from './Phase4/HOD/HODClearance';
import DeanClearance from './Phase4/Dean/DeanClearance';

export default function ClearanceFlow({ facultyId }) {
  const [allDepartmentStatuses, setAllDepartmentStatuses] = useState({
    library: 'pending',
    lab: 'pending',
    pharmacy: 'pending',
    hr: 'pending',
    finance: 'pending',
    records: 'pending',
    it: 'pending',
    admin: 'pending',
    oric: 'pending',
    warden: 'pending',
    hod: 'pending',
    dean: 'pending'
  });

  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [currentPhase, setCurrentPhase] = useState(1);
  const [expandedPhase, setExpandedPhase] = useState(1);

  const handleDepartmentComplete = (departmentData) => {
    const key = departmentData.department.toLowerCase();
    setAllDepartmentStatuses(prev => ({
      ...prev,
      [key]: departmentData.status
    }));
    calculateProgress();
  };

  const calculateProgress = () => {
    const approved = Object.values(allDepartmentStatuses).filter(status => status === 'approved').length;
    const percentage = (approved / 12) * 100;
    setCompletionPercentage(percentage);
  };

  const phase1Complete = allDepartmentStatuses.library === 'approved' && 
                        allDepartmentStatuses.lab === 'approved' && 
                        allDepartmentStatuses.pharmacy === 'approved';

  const phase2Complete = phase1Complete && 
                        allDepartmentStatuses.hr === 'approved' && 
                        allDepartmentStatuses.finance === 'approved' && 
                        allDepartmentStatuses.records === 'approved';

  const phase3Complete = phase2Complete &&
                        allDepartmentStatuses.it === 'approved' &&
                        allDepartmentStatuses.admin === 'approved' &&
                        allDepartmentStatuses.oric === 'approved';

  const phase4Complete = (phase3Complete || allDepartmentStatuses.warden === 'approved') &&
                        allDepartmentStatuses.hod === 'approved' &&
                        allDepartmentStatuses.dean === 'approved';

  const getStatusColor = (status) => {
    switch(status) {
      case 'approved': return '#10b981';
      case 'on-hold': return '#ef4444';
      case 'completed': return '#059669';
      default: return '#9ca3af';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'approved': return <MdCheckCircle />;
      case 'on-hold': return <MdCancel />;
      case 'completed': return <MdEmojiEvents />;
      default: return <MdHourglassEmpty />;
    }
  };

  return (
    <div className="clearance-flow-container">
      <div className="clearance-header">
        <h1><MdAssignment style={{verticalAlign:'middle',marginRight:'8px'}} /> Faculty Clearance Workflow</h1>
        <p>Faculty ID: {facultyId}</p>
      </div>

      {/* Progress Bar */}
      <div className="progress-section">
        <div className="progress-info">
          <span>Overall Progress</span>
          <span className="percentage">{Math.round(completionPercentage)}%</span>
        </div>
        <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: `${completionPercentage}%` }}></div>
        </div>
        <div className="progress-details">
          <span>{Object.values(allDepartmentStatuses).filter(s => s === 'approved').length} of 12 departments approved</span>
        </div>
      </div>

      {/* Phase 1 */}
      <div className="phase-section">
        <div className="phase-header" onClick={() => setExpandedPhase(expandedPhase === 1 ? null : 1)}>
          <div className="phase-title">
            <span className="phase-number">Phase 1</span>
            <span className="phase-name">Physical Assets (Days 1-2)</span>
            <span className="completion-marker">25%</span>
          </div>
          <span className={`phase-status ${phase1Complete ? 'complete' : ''}`}>
            {phase1Complete ? <><MdCheckCircle /> Complete</> : `3/3 - ${Object.values({ library: allDepartmentStatuses.library, lab: allDepartmentStatuses.lab, pharmacy: allDepartmentStatuses.pharmacy }).filter(s => s === 'approved').length}/3`}
          </span>
        </div>
        
        {expandedPhase === 1 && (
          <div className="phase-content">
            <div className="department-grid">
              <div className="department-card">
                <div className="department-header">
                  <span><MdMenuBook style={{verticalAlign:'middle',marginRight:'4px'}} /> Library</span>
                  <span style={{ color: getStatusColor(allDepartmentStatuses.library) }}>{getStatusIcon(allDepartmentStatuses.library)}</span>
                </div>
                {expandedPhase === 1 && <LibraryClearance facultyId={facultyId} onComplete={handleDepartmentComplete} />}
              </div>
              <div className="department-card">
                <div className="department-header">
                  <span><MdScience style={{verticalAlign:'middle',marginRight:'4px'}} /> Lab</span>
                  <span style={{ color: getStatusColor(allDepartmentStatuses.lab) }}>{getStatusIcon(allDepartmentStatuses.lab)}</span>
                </div>
                {expandedPhase === 1 && <LabClearance facultyId={facultyId} onComplete={handleDepartmentComplete} />}
              </div>
              <div className="department-card">
                <div className="department-header">
                  <span><MdLocalPharmacy style={{verticalAlign:'middle',marginRight:'4px'}} /> Pharmacy</span>
                  <span style={{ color: getStatusColor(allDepartmentStatuses.pharmacy) }}>{getStatusIcon(allDepartmentStatuses.pharmacy)}</span>
                </div>
                {expandedPhase === 1 && <PharmacyClearance facultyId={facultyId} onComplete={handleDepartmentComplete} />}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Phase 2 */}
      <div className="phase-section">
        <div className="phase-header" onClick={() => setExpandedPhase(expandedPhase === 2 ? null : 2)} style={{ opacity: phase1Complete ? 1 : 0.5 }}>
          <div className="phase-title">
            <span className="phase-number">Phase 2</span>
            <span className="phase-name">Financial & HR (Days 2-3)</span>
            <span className="completion-marker">50%</span>
          </div>
          <span className={`phase-status ${phase2Complete ? 'complete' : ''}`}>
            {phase2Complete ? <><MdCheckCircle /> Complete</> : `3/3 - ${Object.values({ hr: allDepartmentStatuses.hr, finance: allDepartmentStatuses.finance, records: allDepartmentStatuses.records }).filter(s => s === 'approved').length}/3`}
          </span>
        </div>
        
        {expandedPhase === 2 && phase1Complete && (
          <div className="phase-content">
            <div className="department-grid">
              <div className="department-card">
                <div className="department-header">
                  <span><MdWork style={{verticalAlign:'middle',marginRight:'4px'}} /> HR</span>
                  <span style={{ color: getStatusColor(allDepartmentStatuses.hr) }}>{getStatusIcon(allDepartmentStatuses.hr)}</span>
                </div>
                <HRClearance facultyId={facultyId} onComplete={handleDepartmentComplete} />
              </div>
              <div className="department-card">
                <div className="department-header">
                  <span><MdAccountBalance style={{verticalAlign:'middle',marginRight:'4px'}} /> Finance <span style={{ fontSize: '10px', color: '#ef4444' }}>HIGH PRIORITY</span></span>
                  <span style={{ color: getStatusColor(allDepartmentStatuses.finance) }}>{getStatusIcon(allDepartmentStatuses.finance)}</span>
                </div>
                <FinanceClearance facultyId={facultyId} onComplete={handleDepartmentComplete} />
              </div>
              <div className="department-card">
                <div className="department-header">
                  <span><MdMenuBook style={{verticalAlign:'middle',marginRight:'4px'}} /> Records</span>
                  <span style={{ color: getStatusColor(allDepartmentStatuses.records) }}>{getStatusIcon(allDepartmentStatuses.records)}</span>
                </div>
                <RecordsClearance facultyId={facultyId} onComplete={handleDepartmentComplete} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Phase 3 */}
      <div className="phase-section">
        <div className="phase-header" onClick={() => setExpandedPhase(expandedPhase === 3 ? null : 3)} style={{ opacity: phase2Complete ? 1 : 0.5 }}>
          <div className="phase-title">
            <span className="phase-number">Phase 3</span>
            <span className="phase-name">Operational (Days 3-4)</span>
            <span className="completion-marker">75%</span>
          </div>
          <span className={`phase-status ${phase3Complete ? 'complete' : ''}`}>
            {phase3Complete ? <><MdCheckCircle /> Complete</> : `3/3 - ${Object.values({ it: allDepartmentStatuses.it, admin: allDepartmentStatuses.admin, oric: allDepartmentStatuses.oric }).filter(s => s === 'approved').length}/3`}
          </span>
        </div>
        
        {expandedPhase === 3 && phase2Complete && (
          <div className="phase-content">
            <div className="department-grid">
              <div className="department-card">
                <div className="department-header">
                  <span><MdComputer style={{verticalAlign:'middle',marginRight:'4px'}} /> IT</span>
                  <span style={{ color: getStatusColor(allDepartmentStatuses.it) }}>{getStatusIcon(allDepartmentStatuses.it)}</span>
                </div>
                <ITClearance facultyId={facultyId} onComplete={handleDepartmentComplete} />
              </div>
              <div className="department-card">
                <div className="department-header">
                  <span><MdAccountBalance style={{verticalAlign:'middle',marginRight:'4px'}} /> Admin</span>
                  <span style={{ color: getStatusColor(allDepartmentStatuses.admin) }}>{getStatusIcon(allDepartmentStatuses.admin)}</span>
                </div>
                <AdminClearance facultyId={facultyId} onComplete={handleDepartmentComplete} />
              </div>
              <div className="department-card">
                <div className="department-header">
                  <span><MdBiotech style={{verticalAlign:'middle',marginRight:'4px'}} /> ORIC</span>
                  <span style={{ color: getStatusColor(allDepartmentStatuses.oric) }}>{getStatusIcon(allDepartmentStatuses.oric)}</span>
                </div>
                <ORICClearance facultyId={facultyId} onComplete={handleDepartmentComplete} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Phase 4 */}
      <div className="phase-section">
        <div className="phase-header" onClick={() => setExpandedPhase(expandedPhase === 4 ? null : 4)} style={{ opacity: phase3Complete ? 1 : 0.5 }}>
          <div className="phase-title">
            <span className="phase-number">Phase 4</span>
            <span className="phase-name">Final Authority (Days 4-5)</span>
            <span className="completion-marker">100%</span>
          </div>
          <span className={`phase-status ${phase4Complete ? 'complete' : ''}`}>
            {phase4Complete ? <><MdEmojiEvents /> COMPLETE</> : 'Waiting...'}
          </span>
        </div>
        
        {expandedPhase === 4 && phase3Complete && (
          <div className="phase-content">
            <div className="department-grid">
              <div className="department-card optional">
                <div className="department-header">
                  <span><MdHome style={{verticalAlign:'middle',marginRight:'4px'}} /> Warden <span style={{ fontSize: '10px', color: '#f59e0b' }}>OPTIONAL</span></span>
                  <span style={{ color: getStatusColor(allDepartmentStatuses.warden) }}>{getStatusIcon(allDepartmentStatuses.warden)}</span>
                </div>
                <WardenClearance facultyId={facultyId} onComplete={handleDepartmentComplete} />
              </div>
              <div className="department-card critical">
                <div className="department-header">
                  <span><MdSupervisorAccount style={{verticalAlign:'middle',marginRight:'4px'}} /> HOD <span style={{ fontSize: '10px', color: '#ef4444' }}>CRITICAL</span></span>
                  <span style={{ color: getStatusColor(allDepartmentStatuses.hod) }}>{getStatusIcon(allDepartmentStatuses.hod)}</span>
                </div>
                <HODClearance facultyId={facultyId} allDepartmentStatuses={allDepartmentStatuses} onComplete={handleDepartmentComplete} />
              </div>
              <div className="department-card final">
                <div className="department-header">
                  <span><MdSchool style={{verticalAlign:'middle',marginRight:'4px'}} /> Dean <span style={{ fontSize: '10px', color: '#ef4444' }}>FINAL</span></span>
                  <span style={{ color: getStatusColor(allDepartmentStatuses.dean) }}>{getStatusIcon(allDepartmentStatuses.dean)}</span>
                </div>
                <DeanClearance facultyId={facultyId} allDepartmentStatuses={allDepartmentStatuses} onComplete={handleDepartmentComplete} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Completion Status */}
      {phase4Complete && (
        <div className="completion-banner">
          <h2><MdEmojiEvents style={{verticalAlign:'middle',marginRight:'8px'}} /> CLEARANCE COMPLETE!</h2>
          <p>Faculty has successfully completed all clearance requirements.</p>
          <p>Certificate generated and recorded in system.</p>
        </div>
      )}
    </div>
  );
}
