import { useState } from "react";
import * as yup from "yup";

const passwordSchema = yup.object().shape({
  new_password: yup.string()
    .min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร")
    .required("กรุณากรอกรหัสผ่านใหม่"),
  confirm_password: yup.string()
    .oneOf([yup.ref('new_password'), null], "รหัสผ่านไม่ตรงกัน")
    .required("กรุณายืนยันรหัสผ่าน"),
});

export default function PasswordModal({ isOpen, onClose, onSubmit }) {
  const [passwordData, setPasswordData] = useState({ new_password: "", confirm_password: "" });
  const [errors, setErrors] = useState({});

  const validatePassword = async (data) => {
    try {
      await passwordSchema.validate(data, { abortEarly: false });
      setErrors({});
      return true;
    } catch (error) {
      const validationErrors = error.inner.reduce((acc, curr) => ({
        ...acc,
        [curr.path]: curr.message,
      }), {});
      setErrors(validationErrors);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isValid = await validatePassword(passwordData);
    if (isValid) {
      onSubmit(passwordData.new_password);
      setPasswordData({ new_password: "", confirm_password: "" });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">เปลี่ยนรหัสผ่าน</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="new_password" className="block text-sm font-medium text-gray-700 mb-2">
              รหัสผ่านใหม่ <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              name="new_password"
              value={passwordData.new_password}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="กรอกรหัสผ่านใหม่"
            />
            {errors.new_password && (
              <p className="text-red-500 text-sm mt-1">{errors.new_password}</p>
            )}
          </div>

          <div>
            <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 mb-2">
              ยืนยันรหัสผ่าน <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              name="confirm_password"
              value={passwordData.confirm_password}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="ยืนยันรหัสผ่าน"
            />
            {errors.confirm_password && (
              <p className="text-red-500 text-sm mt-1">{errors.confirm_password}</p>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              บันทึก
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}