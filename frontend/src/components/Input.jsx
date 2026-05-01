/* eslint-disable react/prop-types */
import React, { useId } from "react";

const Input = React.forwardRef(function Input(
  { label, type = "text", className = "", ...props },
  ref
) {
  const id = useId(); // for accessability purpose, we can remove it also htmlFor
  return (
    <div className="w-full">
      {label && (
        <label className="inline-block mb-1.5 pl-1 text-xs font-semibold text-gray-500 uppercase tracking-wide" htmlFor={id}>
          {label}
        </label>
      )}

      <input
        type={type}
        className={`px-4 mb-3 py-3 bg-gray-50 text-gray-800 outline-none rounded-xl
         focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent duration-200 border border-gray-200 w-full text-sm placeholder:text-gray-400 ${className}`}
        ref={ref}
        {...props}
        id={id}
      />
    </div>
  );
});

export default Input;
