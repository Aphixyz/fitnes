export default function ProgressLayout({ children }) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 text-center">
              ความคืบหน้าของฉัน
            </h1>
          </div>
        </div>
        <div className="max-w-6xl mx-auto">
          <div className="p-6">{children}</div>
        </div>
      </div>
    );
  }
  