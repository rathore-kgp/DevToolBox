const ErrorMessage = ({ message }) => {
  if (!message) return null;

  return (
    <div className="rounded-lg border border-red-300 bg-red-100 px-4 py-3 text-red-700">
      {message}
    </div>
  );
};

export default ErrorMessage;