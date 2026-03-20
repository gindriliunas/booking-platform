import { XCircle } from "lucide-react";

export default function PaymentCancelledPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-sm w-full text-center space-y-4">
        <div className="flex justify-center">
          <div className="rounded-full bg-gray-100 p-4">
            <XCircle className="h-10 w-10 text-gray-400" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Payment cancelled</h1>
        <p className="text-gray-500 text-sm">
          No charge was made. If you&apos;d like to complete your payment, please use the link
          your provider sent you.
        </p>
      </div>
    </div>
  );
}
