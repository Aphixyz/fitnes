import React from "react";

function Page() {
  return (
    <div className="flex items-center justify-center h-screen">
      <h1 className="text-center text-5xl">
        ยินดีต้อนรับสู่วงการการออกกำลังกายและโภชนาการเด้อครับจุ้บๆ
      </h1>
      <a
        href="/admin"
        className="text-blue-500 text-xl underline hover:text-blue-700"
      >
        ไปที่หน้าแอดมิน
      </a>
    </div>
  );
}

export default Page;
