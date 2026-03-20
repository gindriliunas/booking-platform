import { Check } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

export default function PaySuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Card>
          <CardContent className="pt-8 pb-8 text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
              <Check className="h-7 w-7 text-green-600" />
            </div>
            <div className="space-y-1">
              <h1 className="text-xl font-bold text-gray-900">Payment received</h1>
              <p className="text-sm text-gray-500">
                You&apos;re all set. Your sessions have been activated.
              </p>
            </div>
            <p className="text-xs text-gray-400">
              Check your email for a receipt from Stripe.
            </p>
            <Link
              href="/portal"
              className="inline-block text-sm text-indigo-600 hover:underline"
            >
              View your sessions in your client portal →
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
