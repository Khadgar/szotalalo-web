import { useState, useRef } from "react";

const useStateRef = (initialValue: any) => {
  const [value, _setValue] = useState(initialValue);
  const valueRef = useRef(value);
  const setValue = (newValue: any) => {
    _setValue(newValue);
    valueRef.current = newValue;
  };
  return [value, valueRef, setValue];
};

const useStateTrigger = (initialValue: any) => {
  const [value, _setValue] = useState(initialValue);
  const [trigger, setTrigger] = useState(false);
  const setValue = (newValue: any) => {
    _setValue(newValue);
    setTrigger((b) => !b);
  };
  return [value, trigger, setValue];
};
export { useStateRef, useStateTrigger };
