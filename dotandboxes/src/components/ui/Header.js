import React from 'react';
import './Header.css';

const Header = ({
    title,
    subtitle,
    icon,
    variant = 'default',
    size = 'large',
    className = '',
    children,
    ...props
}) => {
    const baseClass = `header header--${variant} header--${size}`;

    return (
        <header className={`${baseClass} ${className}`} {...props}>
            <div className="header__content">
                {icon && <div className="header__icon">{icon}</div>}
                <div className="header__text">
                    <h1 className="header__title">{title}</h1>
                    {subtitle && <p className="header__subtitle">{subtitle}</p>}
                </div>
            </div>
            {children && <div className="header__actions">{children}</div>}
        </header>
    );
};

export default Header;
