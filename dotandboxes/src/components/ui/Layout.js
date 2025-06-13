import React from 'react';
import './Layout.css';

const Layout = ({ children, variant = 'default', className = '' }) => {
    const baseClass = `layout-container layout--${variant}`;

    return (
        <div className={`${baseClass} ${className}`}>
            <div className="layout-content">
                {children}
            </div>
        </div>
    );
};

export default Layout;
