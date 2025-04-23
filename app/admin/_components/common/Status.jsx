export default function StatusBadge({ status }) {
    return (
      <span
        className={`inline-block px-3 py-1 text-sm font-semibold rounded-full border ${
          status === "active"
            ? "text-green-600 border-green-600"
            : status === "inactive"
            ? "text-red-600 border-red-600"
            : "text-yellow-600 border-yellow-600"
        }`}
      >
        {status === "active"
          ? "Active"
          : status === "inactive"
          ? "Inactive"
          : "Pending"}
      </span>
    );
  }
  