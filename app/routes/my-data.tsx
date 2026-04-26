import { Link } from "react-router"

import { Button } from "~/components/ui/button"

export default function MyDataPage() {
  return (
    <div className="flex min-h-svh flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-lg font-medium">My data</h1>
        <p className="text-muted-foreground text-sm">
          Reserved for profile and personal information.
        </p>
      </div>
      <Button asChild variant="outline" className="w-fit">
        <Link to="/dashboard">Back to dashboard</Link>
      </Button>
    </div>
  )
}
