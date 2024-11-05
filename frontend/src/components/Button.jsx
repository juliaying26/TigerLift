import React from 'react';

export default function Button({ onClick, disabled, className, children }) {
    return (
        <button 
            onClick={onClick} 
            disabled={disabled} 
            className={`button ${className}`}
        >
            {children}
        </button>
    );
};
