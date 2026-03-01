import React from 'react';

export default function FormInput({
  label,
  type = 'text',
  name,
  value,
  onChange,
  onBlur,
  error,
  placeholder,
  disabled = false,
  required = false,
  hint,
  icon: Icon,
}) {
  return (
    <div className="form-group">
      {label && (
        <label>
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        {Icon && <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '18px' }}><Icon /></div>}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          style={{ paddingLeft: Icon ? '44px' : '12px' }}
          className="admin-input"
        />
      </div>
      {hint && <p className="form-hint">{hint}</p>}
      {error && <p className="form-error">{error}</p>}
    </div>
  );
}
