import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertCircle,
  CheckCircle2,
  User,
  Loader2,
  Eye,
  EyeOff,
  Mail,
  Lock,
  Phone,
  Calendar,
} from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import { verifyRegistrationParams } from "@/actions/trainer/registration/generateRegistrationLink";
import { createMemberAndRegistration } from "@/actions/register/registerNewMember";

// Loading fallback component
function RegisterPageLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg mx-auto w-full">
        <div className="bg-white p-6 sm:p-8 rounded-lg shadow-xl border border-gray-200">
          <Skeleton className="h-12 w-3/4 mb-4 mx-auto" />
          <Skeleton className="h-8 w-full mb-2" />
          <Skeleton className="h-8 w-full mb-2" />
          <Skeleton className="h-8 w-full mb-2" />
          <Skeleton className="h-8 w-full mb-2" />
          <Skeleton className="h-8 w-full mb-6" />
          <Skeleton className="h-60 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// Server Component - Default Export
export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const trainerId = searchParams.get("trainer");
  const token = searchParams.get("token");

  // Verification states
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState(null);
  const [trainerInfo, setTrainerInfo] = useState(null);

  // Form states
  const [formData, setFormData] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Password visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Verify registration link
  useEffect(() => {
    const verifyParams = async () => {
      setVerifying(true);

      if (!trainerId || !token) {
        setError("ลิงก์ลงทะเบียนไม่ถูกต้อง กรุณาตรวจสอบลิงก์อีกครั้ง");
        setVerifying(false);
        return;
      }

      try {
        const result = await verifyRegistrationParams(token, trainerId);

        if (result.success) {
          setTrainerInfo(result.trainer);
        } else {
          setError(result.message || "ลิงก์ลงทะเบียนไม่ถูกต้องหรือหมดอายุแล้ว");
        }
      } catch (error) {
        console.error(error);
        setError("เกิดข้อผิดพลาดในการตรวจสอบลิงก์ลงทะเบียน");
      } finally {
        setVerifying(false);
      }
    };

    verifyParams();
  }, [trainerId, token]);

  // Real-time validation
  const validateField = (field, value) => {
    const newErrors = { ...formErrors };

    switch (field) {
      case "member_username":
        if (!value) {
          newErrors.member_username = "กรุณากรอกชื่อผู้ใช้";
        } else if (value.length < 3) {
          newErrors.member_username = "ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร";
        } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
          newErrors.member_username =
            "ชื่อผู้ใช้ควรประกอบด้วยตัวอักษร ตัวเลข และ _ เท่านั้น";
        } else {
          delete newErrors.member_username;
        }
        break;

      case "member_email":
        if (!value) {
          newErrors.member_email = "กรุณากรอกอีเมล";
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          newErrors.member_email = "รูปแบบอีเมลไม่ถูกต้อง";
        } else {
          delete newErrors.member_email;
        }
        break;

      case "member_password":
        if (!value) {
          newErrors.member_password = "กรุณากรอกรหัสผ่าน";
        } else if (value.length < 6) {
          newErrors.member_password = "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร";
        } else {
          delete newErrors.member_password;
        }

        // Re-validate confirm password if it exists
        if (formData.member_confirm_password) {
          if (value !== formData.member_confirm_password) {
            newErrors.member_confirm_password = "รหัสผ่านไม่ตรงกัน";
          } else {
            delete newErrors.member_confirm_password;
          }
        }
        break;

      case "member_confirm_password":
        if (!value) {
          newErrors.member_confirm_password = "กรุณายืนยันรหัสผ่าน";
        } else if (value !== formData.member_password) {
          newErrors.member_confirm_password = "รหัสผ่านไม่ตรงกัน";
        } else {
          delete newErrors.member_confirm_password;
        }
        break;

      case "member_firstname":
        if (!value) {
          newErrors.member_firstname = "กรุณากรอกชื่อ";
        } else {
          delete newErrors.member_firstname;
        }
        break;

      case "member_lastname":
        if (!value) {
          newErrors.member_lastname = "กรุณากรอกนามสกุล";
        } else {
          delete newErrors.member_lastname;
        }
        break;

      case "member_phone":
        if (value && !/^[0-9\-\s]+$/.test(value)) {
          newErrors.member_phone = "รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง";
        } else {
          delete newErrors.member_phone;
        }
        break;

      case "member_gender":
        // Optional field, no validation needed
        delete newErrors.member_gender;
        break;

      case "member_dob":
        // Optional field, no validation needed
        delete newErrors.member_dob;
        break;
    }

    setFormErrors(newErrors);
  };

  // Validate entire form
  const validateForm = () => {
    const newErrors = {};

    // Required fields validation
    if (!formData.member_username) {
      newErrors.member_username = "กรุณากรอกชื่อผู้ใช้";
    } else if (formData.member_username.length < 3) {
      newErrors.member_username = "ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร";
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.member_username)) {
      newErrors.member_username =
        "ชื่อผู้ใช้ควรประกอบด้วยตัวอักษร ตัวเลข และ _ เท่านั้น";
    }

    if (!formData.member_email) {
      newErrors.member_email = "กรุณากรอกอีเมล";
    } else if (!/\S+@\S+\.\S+/.test(formData.member_email)) {
      newErrors.member_email = "รูปแบบอีเมลไม่ถูกต้อง";
    }

    if (!formData.member_password) {
      newErrors.member_password = "กรุณากรอกรหัสผ่าน";
    } else if (formData.member_password.length < 6) {
      newErrors.member_password = "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร";
    }

    if (!formData.member_confirm_password) {
      newErrors.member_confirm_password = "กรุณายืนยันรหัสผ่าน";
    } else if (formData.member_password !== formData.member_confirm_password) {
      newErrors.member_confirm_password = "รหัสผ่านไม่ตรงกัน";
    }

    if (!formData.member_firstname) {
      newErrors.member_firstname = "กรุณากรอกชื่อ";
    }

    if (!formData.member_lastname) {
      newErrors.member_lastname = "กรุณากรอกนามสกุล";
    }

    // Optional fields validation
    if (formData.member_phone && !/^[0-9\-\s]+$/.test(formData.member_phone)) {
      newErrors.member_phone = "รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง";
    }

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Enhanced form data handler with real-time validation
  const handleFormDataChange = (newData) => {
    setFormData(newData);

    // Get the field that changed
    const changedField = Object.keys(newData).find(
      (key) => newData[key] !== formData[key]
    );

    if (changedField) {
      validateField(changedField, newData[changedField]);
    }
  };

  // Check if form is valid for submit button state
  const isFormValid = () => {
    return (
      formData.member_username &&
      formData.member_username.length >= 3 &&
      /^[a-zA-Z0-9_]+$/.test(formData.member_username) &&
      formData.member_email &&
      /\S+@\S+\.\S+/.test(formData.member_email) &&
      formData.member_password &&
      formData.member_password.length >= 6 &&
      formData.member_confirm_password &&
      formData.member_password === formData.member_confirm_password &&
      formData.member_firstname &&
      formData.member_lastname &&
      Object.keys(formErrors).length === 0
    );
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const result = await createMemberAndRegistration(formData, trainerId);

      if (result.success) {
        // Success - redirect to package selection page
        router.push(
          `/payment/${result.registration_id}/packages?trainer=${trainerId}&member=${result.member_id}`
        );
      } else {
        setFormErrors({ submit: result.message });
      }
    } catch (error) {
      console.error("Registration error:", error);
      setFormErrors({ submit: "เกิดข้อผิดพลาดในการสร้างบัญชี" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Suspense fallback={<RegisterPageLoading />}>
      <RegisterForm />
    </Suspense>
  );
}
