import React, { useState } from "react";
import { DatePicker, TimePicker } from "antd";
import dayjs from "dayjs";

export default function MyDateTimePicker({
  date,
  setDate,
  time,
  setTime,
  allowClear = true,
}) {
  const handleDateChange = (value) => {
    setDate(value);
    console.log("Selected Date:", value ? value.format("YYYY-MM-DD") : null);
  };

  const handleTimeChange = (value) => {
    setTime(value);
    console.log("Selected Time:", value ? value.format("HH:mm:ss") : null);
  };

  const disabledDate = (current) => {
    // Can't select days before today
    return current && current < dayjs().startOf("day");
  };

  return (
    <div>
      <DatePicker
        onChange={handleDateChange}
        placeholder="Select date"
        style={{ marginRight: "8px" }}
        value={date}
        disabledDate={disabledDate}
        allowClear={allowClear}
      />
      <TimePicker
        format="h:mm a"
        onChange={handleTimeChange}
        placeholder="Select time"
        value={time}
        allowClear={allowClear}
      />
    </div>
  );
}
