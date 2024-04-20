import React from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  divider?: boolean;
}

const LabelledInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, type = "text", divider = true, ...props }, ref) => {
    return (
      <label className="input input-bordered flex items-center select-none">
        <div className={type == "checkbox" ? "order-last ms-4" : ""}>{label}</div>
        {divider && (
          <div className="divider divider-horizontal"></div>
        )}
        <input type={type} aria-label={label} ref={ref} {...props} />
      </label>
    );
  }
);

export default LabelledInput;
