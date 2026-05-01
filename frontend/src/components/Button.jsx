/* eslint-disable react/prop-types */

function Button({
  children,
  //   type = "button",
  bgColor = "bg-gradient-to-r from-indigo-600 to-purple-600",
  textColor,
  className = "",
  ...props
}) {
  return (
    <button
      className={`px-5 py-3 rounded-xl font-bold text-sm shadow-md hover:shadow-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed ${bgColor} ${textColor} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
