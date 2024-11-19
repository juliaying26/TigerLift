import React, { useState } from 'react';
import Select from 'react-select'

export default function Dropdown({ options, inputValue, setInputValue, placeholder }) {
   
    // const [inputValue, setInputValue] = useState('');

    const handleChange = (e) => {
        setInputValue(e || null);
      };


  return (
    <div className='p-1'>

        <Select
            value={inputValue}
            onChange={handleChange}
            options={options}
            placeholder={placeholder}
        />

    </div>

    
  );
}
