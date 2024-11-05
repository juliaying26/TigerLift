import React from 'react';

export default function IconButton({ type, onClick, disabled, className }) {
    const renderIcon = () =>{
        switch (type) {
            case 'back':
                return (
                    <svg>
                    </svg>
                );
            case 'checkmark':
                return (
                    <svg>
                    </svg>
                );
            case 'close':
                return (
                    <svg>
                    </svg>
                );
            default:
                return null;
        }
    }

    return (
        <button 
            onClick={onClick} 
            disabled={disabled} 
            className={`icon-button ${className}`}
        >
            {renderIcon()}
        </button>
    );
};