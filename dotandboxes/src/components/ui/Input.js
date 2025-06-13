import React, { forwardRef } from 'react';
import './Input.css';

const Input = forwardRef(({
    label,
    error,
    helper,
    icon,
    variant = 'default',
    size = 'medium',
    fullWidth = false,
    className = '',
    type = 'text',
    id,
    ...props
}, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const baseClass = `input-group input-group--${variant} input-group--${size}`;
    const modifierClasses = [
        fullWidth && 'input-group--full-width',
        error && 'input-group--error'
    ].filter(Boolean).join(' ');

    return (
        <div className={`${baseClass} ${modifierClasses} ${className}`}>
            {label && (
                <label htmlFor={inputId} className="input__label">
                    {label}
                </label>
            )}
            <div className="input__wrapper">
                {icon && <span className="input__icon">{icon}</span>}
                <input
                    ref={ref}
                    id={inputId}
                    type={type}
                    className={`input__field ${icon ? 'input__field--with-icon' : ''}`}
                    {...props}
                />
            </div>
            {helper && !error && (
                <span className="input__helper">{helper}</span>
            )}
            {error && (
                <span className="input__error">{error}</span>
            )}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;
