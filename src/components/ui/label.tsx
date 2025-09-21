import React from 'react';

type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement> & {
  children: React.ReactNode;
};

export const Label = ({ children, className = '', ...rest }: LabelProps) => {
  return (
    <label className={`block text-sm font-medium text-fg/80 mb-1 ${className}`} {...rest}>
      {children}
    </label>
  );
};

export default Label;
