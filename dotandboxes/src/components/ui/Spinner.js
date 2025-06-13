import React from 'react';
import './Spinner.css';

const Spinner = ({
    size = 'medium',
    variant = 'primary',
    className = '',
    text,
    ...props
}) => {
    const baseClass = `spinner spinner--${size} spinner--${variant}`;

    return (
        <div className={`spinner-container ${className}`} {...props}>
            <div className={baseClass}>
                <div className="spinner__circle"></div>
            </div>
            {text && <p className="spinner__text">{text}</p>}
        </div>
    );
};

export default Spinner;
