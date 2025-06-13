import React from 'react';
import './Select.css';

const Select = ({
    label,
    error,
    helper,
    icon,
    variant = 'default',
    size = 'medium',
    fullWidth = false,
    className = '',
    id,
    children,
    ...props
}) => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
    const baseClass = `select-group select-group--${variant} select-group--${size}`;
    const modifierClasses = [
        fullWidth && 'select-group--full-width',
        error && 'select-group--error'
    ].filter(Boolean).join(' ');

    return (
        <div className={`${baseClass} ${modifierClasses} ${className}`}>
            {label && (
                <label htmlFor={selectId} className="select__label">
                    {label}
                </label>
            )}
            <div className="select__wrapper">
                {icon && <span className="select__icon">{icon}</span>}
                <select
                    id={selectId}
                    className={`select__field ${icon ? 'select__field--with-icon' : ''}`}
                    {...props}
                >
                    {children}
                </select>
                <span className="select__arrow">▼</span>
            </div>
            {helper && !error && (
                <span className="select__helper">{helper}</span>
            )}
            {error && (
                <span className="select__error">{error}</span>
            )}
        </div>
    );
};

export default Select;
