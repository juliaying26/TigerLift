import React, { useState } from "react";
import { DatePicker, TimePicker } from "antd";

export default function MyDateTimePicker() {
  const [date, setDate] = useState(null);
  const [time, setTime] = useState(null);

  const handleDateChange = (value) => {
    setDate(value);
    console.log("Selected Date:", value ? value.format("YYYY-MM-DD") : null);
  };

  const handleTimeChange = (value) => {
    setTime(value);
    console.log("Selected Time:", value ? value.format("HH:mm:ss") : null);
  };

  return (
    <div>
      <DatePicker
        onChange={handleDateChange}
        placeholder="Select date"
        style={{ marginRight: "8px" }}
      />
      <TimePicker onChange={handleTimeChange} placeholder="Select time" />
    </div>
  );
}
