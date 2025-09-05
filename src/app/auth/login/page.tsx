import AuthLayout from "@/widgets/layout/AuthLayout";
import { OTPLoginForm } from "@/features/auth";

export default function LoginPage() {
  return (
    <AuthLayout>
      <OTPLoginForm />
    </AuthLayout>
  )
}