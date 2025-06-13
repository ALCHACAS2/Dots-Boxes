import React from 'react';
import './Modal.css';

const Modal = ({ 
    isOpen, 
    onClose, 
    title = "Controles del Juego",
    children,
    variant = "default"
}) => {
    if (!isOpen) return null;

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="modal-backdrop" onClick={handleBackdropClick}>
            <div className={`modal-container modal-container--${variant}`}>
                <div className="modal-header">
                    <h3 className="modal-title">{title}</h3>
                    <button 
                        className="modal-close-btn"
                        onClick={onClose}
                        aria-label="Cerrar modal"
                    >
                        ×
                    </button>
                </div>
                <div className="modal-content">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;
