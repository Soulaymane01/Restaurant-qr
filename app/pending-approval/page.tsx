import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock } from "lucide-react"

export default function PendingApprovalPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Clock className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <CardTitle>Account Pending Approval</CardTitle>
          <CardDescription>
            Your account has been created successfully but is currently pending approval from an administrator.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-muted-foreground">
            You will receive an email notification once your account has been approved. Please contact your
            administrator if you have any questions.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
