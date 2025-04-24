// components/shared/ProfileLoading.jsx

export default function ProfileLoading({ title = "กำลังโหลดข้อมูล..." }) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">{title}</h1>
  
        <div className="grid md:grid-cols-2 gap-6 animate-pulse">
          <div className="col-span-2 flex justify-center mb-4">
            <div className="w-32 h-32 bg-gray-300 rounded-full" />
          </div>
  
          {[...Array(8)].map((_, i) => (
            <div key={i}>
              <div className="h-4 bg-gray-300 rounded w-24 mb-2" />
              <div className="h-6 bg-gray-200 rounded w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }
  