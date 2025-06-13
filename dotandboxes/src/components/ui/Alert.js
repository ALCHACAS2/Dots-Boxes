import React from 'react';
import './Alert.css';

const Alert = ({ 
  children, 
  variant = 'info', 
  size = 'medium',
  dismissible = false,
  onDismiss,
  icon,
  title,
  className = '',
  ...props 
}) => {
  const baseClass = `alert alert--${variant} alert--${size}`;
  const modifierClasses = [
    dismissible && 'alert--dismissible'
  ].filter(Boolean).join(' ');
  
  const defaultIcons = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌'
  };
  
  const displayIcon = icon || defaultIcons[variant];
  
  return (
    <div className={`${baseClass} ${modifierClasses} ${className}`} {...props}>
      <div className="alert__content">
        {displayIcon && (
          <div className="alert__icon">{displayIcon}</div>
        )}
        <div className="alert__body">
          {title && <h4 className="alert__title">{title}</h4>}
          <div className="alert__text">{children}</div>
        </div>
      </div>
      {dismissible && (
        <button className="alert__dismiss" onClick={onDismiss}>
          ✕
        </button>
      )}
    </div>
  );
};

export default Alert;
