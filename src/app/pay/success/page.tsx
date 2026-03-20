import { CheckCircle } from "lucide-react";

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-sm w-full text-center space-y-4">
        <div className="flex justify-center">
          <div className="rounded-full bg-green-100 p-4">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Payment complete!</h1>
        <p className="text-gray-500 text-sm">
          Thank you — your payment was successful. Your sessions have been added to your account.
          You can now close this page.
        </p>
      </div>
    </div>
  );
}
