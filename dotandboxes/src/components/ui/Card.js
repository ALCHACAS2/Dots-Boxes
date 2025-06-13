import React from 'react';
import './Card.css';

const Card = ({
    children,
    variant = 'default',
    size = 'medium',
    glassmorphism = true,
    hover = true,
    className = '',
    style = {},
    ...props
}) => {
    const baseClass = `card card--${variant} card--${size}`;
    const modifierClasses = [
        glassmorphism && 'card--glass',
        hover && 'card--hover'
    ].filter(Boolean).join(' ');

    return (
        <div
            className={`${baseClass} ${modifierClasses} ${className}`}
            style={style}
            {...props}
        >
            {children}
        </div>
    );
};

export default Card;
