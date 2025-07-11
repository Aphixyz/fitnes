import { getShortThaiDays } from "@/utils/utils.js";

/**
 * MacroPlanTable - ตารางแสดง macro plan รายสัปดาห์ (Card Layout, Responsive, Mobile-first)
 * @param {Object} props
 * @param {number} calories - เป้าหมายแคลอรี่
 * @param {number} protein_g - โปรตีน (กรัม)
 * @param {number} carb_g - คาร์บ (กรัม)
 * @param {number} fat_g - ไขมัน (กรัม)
 */
const MacroPlanTable = ({ calories, protein_g, carb_g, fat_g }) => {
  const days = getShortThaiDays();

  // ข้อมูลแต่ละแถว (label, value, สี)
  const rows = [
    {
      label: "พลังงาน",
      values: Array(7).fill(calories),
      color: "bg-blue-200 text-blue-900",
      unit: "",
      circle: true,
    },
    {
      label: "โปรตีน",
      values: Array(7).fill(protein_g),
      color: "bg-orange-200 text-orange-900",
      unit: "ก.",
      circle: false,
    },
    {
      label: "ไขมัน",
      values: Array(7).fill(fat_g),
      color: "bg-yellow-200 text-yellow-900",
      unit: "ก.",
      circle: false,
    },
    {
      label: "คาร์บ",
      values: Array(7).fill(carb_g),
      color: "bg-green-200 text-green-900",
      unit: "ก.",
      circle: false,
    },
  ];

  return (
    <div className="w-full max-w-md md:max-w-2xl mx-auto mt-6">
      <div className="bg-white rounded-2xl shadow-lg p-4 md:p-8">
        <h2 className="text-xl md:text-2xl font-bold text-center mb-4">
          แผนโภชนาการ
        </h2>
        {/* ตาราง macro (responsive grid) */}
        <div className="w-full">
          {/* Calories (พลังงาน) */}
          <div className="grid grid-cols-7 gap-1 md:gap-2 w-full mb-1">
            {rows[0].values.map((val, idx) => (
              <div
                key={`cal-${idx}`}
                className="flex flex-col items-center justify-center w-full"
              >
                <div
                  className={`w-full h-10 md:h-12 rounded-md flex items-center justify-center font-semibold text-xs md:text-xs ${rows[0].color}`}
                  tabIndex={0}
                  aria-label={`พลังงาน ${val} วัน${days[idx]}`}
                >
                  {val}
                </div>
              </div>
            ))}
          </div>
          {/* Protein (โปรตีน) */}
          <div className="grid grid-cols-7 gap-1 md:gap-2 w-full mb-1">
            {rows[1].values.map((val, idx) => (
              <div
                key={`pro-${idx}`}
                className="flex flex-col items-center justify-center w-full"
              >
                <div
                  className={`w-full h-10 md:h-12 rounded-lg flex flex-col items-center justify-center font-semibold text-xs md:text-xs ${rows[1].color}`}
                  tabIndex={0}
                  aria-label={`โปรตีน ${val} กรัม วัน${days[idx]}`}
                >
                  <span>{val}</span>
                  <span className="text-[10px] text-gray-700">ก.</span>
                </div>
              </div>
            ))}
          </div>
          {/* Fat (ไขมัน) */}
          <div className="grid grid-cols-7 gap-1 md:gap-2 w-full mb-1">
            {rows[2].values.map((val, idx) => (
              <div
                key={`fat-${idx}`}
                className="flex flex-col items-center justify-center w-full"
              >
                <div
                  className={`w-full h-10 md:h-12 rounded-lg flex flex-col items-center justify-center font-semibold text-xs md:text-xs ${rows[2].color}`}
                  tabIndex={0}
                  aria-label={`ไขมัน ${val} กรัม วัน${days[idx]}`}
                >
                  <span>{val}</span>
                  <span className="text-[10px] text-gray-700">ก.</span>
                </div>
              </div>
            ))}
          </div>
          {/* Carb (คาร์บ) */}
          <div className="grid grid-cols-7 gap-1 md:gap-2 w-full mb-1">
            {rows[3].values.map((val, idx) => (
              <div
                key={`carb-${idx}`}
                className="flex flex-col items-center justify-center w-full"
              >
                <div
                  className={`w-full h-10 md:h-12 rounded-lg flex flex-col items-center justify-center font-semibold text-xs md:text-xs ${rows[3].color}`}
                  tabIndex={0}
                  aria-label={`คาร์บ ${val} กรัม วัน${days[idx]}`}
                >
                  <span>{val}</span>
                  <span className="text-[10px] text-gray-700">ก.</span>
                </div>
              </div>
            ))}
          </div>
          {/* Label วัน */}
          <div className="grid grid-cols-7 gap-1 md:gap-2 mt-1 w-full">
            {days.map((d) => (
              <span
                key={d}
                className="w-full text-center text-xs md:text-sm text-gray-700 font-extrabold"
              >
                {d}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MacroPlanTable;
