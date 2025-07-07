import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import RegisterForm from "./RegisterForm";

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
  return (
    <Suspense fallback={<RegisterPageLoading />}>
      <RegisterForm />
    </Suspense>
  );
}
