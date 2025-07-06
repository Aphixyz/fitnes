"use client";

import { useState, useTransition } from "react";
import { changePassword } from "@/actions/trainer/profile/changePassword";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  CheckCircle,
  AlertCircle,
  Loader2,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";

export default function PasswordForm({ trainerId }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState({ type: "", content: "" });
  const [isOpen, setIsOpen] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [formData, setFormData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const validatePassword = (password) => {
    const errors = [];

    if (password.length < 6) {
      errors.push("รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร");
    }

    if (!/[A-Za-z]/.test(password)) {
      errors.push("รหัสผ่านต้องมีตัวอักษรอย่างน้อย 1 ตัว");
    }

    if (!/[0-9]/.test(password)) {
      errors.push("รหัสผ่านต้องมีตัวเลขอย่างน้อย 1 ตัว");
    }

    return errors;
  };

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: "", color: "" };

    let score = 0;

    // ความยาว
    if (password.length >= 6) score += 1;
    if (password.length >= 8) score += 1;

    // ตัวอักษร
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;

    // ตัวเลข
    if (/[0-9]/.test(password)) score += 1;

    // อักขระพิเศษ
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 2)
      return { strength: score, label: "อ่อน", color: "bg-red-500" };
    if (score <= 4)
      return { strength: score, label: "ปานกลาง", color: "bg-yellow-500" };
    return { strength: score, label: "แข็งแกร่ง", color: "bg-green-500" };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", content: "" });

    // ตรวจสอบข้อมูลที่จำเป็น
    if (
      !formData.current_password ||
      !formData.new_password ||
      !formData.confirm_password
    ) {
      setMessage({ type: "error", content: "กรุณากรอกข้อมูลให้ครบถ้วน" });
      return;
    }

    // ตรวจสอบรหัสผ่านใหม่
    const passwordErrors = validatePassword(formData.new_password);
    if (passwordErrors.length > 0) {
      setMessage({ type: "error", content: passwordErrors.join(", ") });
      return;
    }

    // ตรวจสอบการยืนยันรหัสผ่าน
    if (formData.new_password !== formData.confirm_password) {
      setMessage({
        type: "error",
        content: "รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน",
      });
      return;
    }

    startTransition(async () => {
      try {
        const result = await changePassword({
          trainer_id: trainerId,
          current_password: formData.current_password,
          new_password: formData.new_password,
        });

        if (result.success) {
          setMessage({ type: "success", content: result.message });
          // รีเซ็ตฟอร์มหลังจากเปลี่ยนรหัสผ่านสำเร็จ
          setFormData({
            current_password: "",
            new_password: "",
            confirm_password: "",
          });
          // ปิด modal หลังจาก 2 วินาที
          setTimeout(() => {
            setIsOpen(false);
            setMessage({ type: "", content: "" });
          }, 2000);
        } else {
          setMessage({ type: "error", content: result.message });
        }
      } catch (error) {
        console.error("Error changing password:", error);
        setMessage({
          type: "error",
          content: "เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน",
        });
      }
    });
  };

  const handleCancel = () => {
    setFormData({
      current_password: "",
      new_password: "",
      confirm_password: "",
    });
    setMessage({ type: "", content: "" });
    setIsOpen(false);
  };

  const passwordStrength = getPasswordStrength(formData.new_password);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          การจัดการรหัสผ่าน
        </CardTitle>
        <CardDescription>
          เปลี่ยนรหัสผ่านสำหรับความปลอดภัยของบัญชี
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto">
              <Lock className="mr-2 h-4 w-4" />
              เปลี่ยนรหัสผ่าน
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>เปลี่ยนรหัสผ่าน</DialogTitle>
              <DialogDescription>
                กรอกรหัสผ่านปัจจุบันและรหัสผ่านใหม่ที่คุณต้องการ
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Current Password */}
              <div className="space-y-2">
                <Label htmlFor="current_password">รหัสผ่านปัจจุบัน</Label>
                <div className="relative">
                  <Input
                    id="current_password"
                    name="current_password"
                    type={showPasswords.current ? "text" : "password"}
                    value={formData.current_password}
                    onChange={handleChange}
                    placeholder="กรอกรหัสผ่านปัจจุบัน"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("current")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPasswords.current ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="new_password">รหัสผ่านใหม่</Label>
                <div className="relative">
                  <Input
                    id="new_password"
                    name="new_password"
                    type={showPasswords.new ? "text" : "password"}
                    value={formData.new_password}
                    onChange={handleChange}
                    placeholder="กรอกรหัสผ่านใหม่"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("new")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPasswords.new ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {formData.new_password && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${passwordStrength.color}`}
                          style={{
                            width: `${(passwordStrength.strength / 6) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm text-gray-600">
                        {passwordStrength.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      รหัสผ่านที่แข็งแกร่งควรมีตัวอักษรใหญ่-เล็ก ตัวเลข
                      และอักขระพิเศษ
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirm_password">ยืนยันรหัสผ่านใหม่</Label>
                <div className="relative">
                  <Input
                    id="confirm_password"
                    name="confirm_password"
                    type={showPasswords.confirm ? "text" : "password"}
                    value={formData.confirm_password}
                    onChange={handleChange}
                    placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("confirm")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPasswords.confirm ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {/* Password Match Indicator */}
                {formData.confirm_password && (
                  <p
                    className={`text-xs ${
                      formData.new_password === formData.confirm_password
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {formData.new_password === formData.confirm_password
                      ? "✓ รหัสผ่านตรงกัน"
                      : "✗ รหัสผ่านไม่ตรงกัน"}
                  </p>
                )}
              </div>

              {/* Alert Messages */}
              {message.content && (
                <Alert
                  variant={
                    message.type === "success" ? "default" : "destructive"
                  }
                >
                  {message.type === "success" ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <AlertDescription>{message.content}</AlertDescription>
                </Alert>
              )}

              {/* Buttons */}
              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={isPending} className="flex-1">
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      กำลังเปลี่ยน...
                    </>
                  ) : (
                    "เปลี่ยนรหัสผ่าน"
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isPending}
                  className="flex-1"
                >
                  ยกเลิก
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
