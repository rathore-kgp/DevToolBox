const Button = ({
  children,
  type = 'button',
  onClick,
  disabled = false,
  className = '',
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        rounded-lg
        px-4
        py-2
        font-medium
        transition
        bg-blue-600
        text-white
        hover:bg-blue-700
        disabled:cursor-not-allowed
        disabled:opacity-50
        ${className}
      `}
    >
      {children}
    </button>
  );
};

export default Button;