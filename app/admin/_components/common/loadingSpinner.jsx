import PropTypes from "prop-types";

export default function LoadingSpinner({ message = "กำลังโหลด..." }) {
  return (
    <div className="flex flex-col justify-center items-center py-12 gap-4">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 border-4 border-blue-200 rounded-full animate-spin"></div>
        <div className="absolute inset-0 border-t-4 border-blue-600 rounded-full animate-spin"></div>
      </div>
      <div className="text-lg font-semibold text-gray-700 flex items-center gap-1">
        <span>{message}</span>
        <span className="animate-pulse inline-flex">
          <span className="opacity-100">.</span>
          <span className="opacity-75 animation-delay-100">.</span>
          <span className="opacity-50 animation-delay-200">.</span>
        </span>
      </div>
    </div>
  );
}

LoadingSpinner.propTypes = {
  message: PropTypes.string,
};