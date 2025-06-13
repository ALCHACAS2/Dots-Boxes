import React from 'react';
import './Button.css';

const Button = ({
    children,
    variant = 'primary',
    size = 'medium',
    fullWidth = false,
    loading = false,
    disabled = false,
    icon = null,
    className = '',
    onClick,
    type = 'button',
    ...props
}) => {
    const baseClass = `btn btn--${variant} btn--${size}`;
    const modifierClasses = [
        fullWidth && 'btn--full-width',
        loading && 'btn--loading',
        disabled && 'btn--disabled'
    ].filter(Boolean).join(' ');

    return (
        <button
            type={type}
            className={`${baseClass} ${modifierClasses} ${className}`}
            onClick={onClick}
            disabled={disabled || loading}
            {...props}
        >
            {loading && <div className="btn__spinner" />}
            {icon && !loading && <span className="btn__icon">{icon}</span>}
            <span className="btn__text">{children}</span>
        </button>
    );
};

export default Button;
