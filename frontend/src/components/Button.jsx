import React from 'react';

const Button = ({ onClick, disabled, className, children }) => {
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

export default Button;