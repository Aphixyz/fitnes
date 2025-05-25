import { redirect } from "next/navigation";

/**
 * Main Member Page - Redirect to Dashboard
 * @param {Object} params - URL parameters
 */
export default function MemberPage({ params }) {
  // Redirect ไปยัง dashboard
  redirect(`/member/${params.id}/dashboard`);
}

// Metadata สำหรับ SEO
export async function generateMetadata({ params }) {
  return {
    title: `สมาชิก ${params.id} | FitTrack`,
    description: "หน้าหลักสำหรับสมาชิก FitTrack",
  };
}
