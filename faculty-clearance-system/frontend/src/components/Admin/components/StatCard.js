import React from 'react';

export default function StatCard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  type = 'total',
  onClick 
}) {
  return (
    <div 
      className={`stat-card ${type}`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="stat-card-header">
        <h3 className="stat-card-title">{title}</h3>
        {Icon && <div className="stat-card-icon"><Icon /></div>}
      </div>
      <p className="stat-card-value">{value}</p>
      {change !== undefined && (
        <p className={`stat-card-change ${change >= 0 ? 'positive' : 'negative'}`}>
          {change >= 0 ? '↑' : '↓'} {Math.abs(change)}% from last month
        </p>
      )}
    </div>
  );
}
