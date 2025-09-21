import React from 'react';

type CheckboxProps = React.InputHTMLAttributes<HTMLInputElement> & {
  checked?: boolean;
};

export const Checkbox = ({ checked, className = '', ...rest }: CheckboxProps) => {
  return (
    <input
      type="checkbox"
      checked={checked}
      className={`h-4 w-4 rounded border-border text-accent focus:ring-0 ${className}`}
      {...rest}
    />
  );
};

export default Checkbox;
