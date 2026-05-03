import { Link } from "react-router"

import { Button } from "~/components/ui/button"

export default function Home() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6">
      <div className="flex max-w-md min-w-0 flex-col gap-6 text-center text-sm leading-loose">
        <div className="flex flex-col gap-2">
          <h1 className="text-lg font-medium">Vacancy Manager</h1>
          <p className="text-muted-foreground">
            Páginas de exemplo com shadcn: login e painel com sidebar.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
          <Button asChild variant="outline">
            <Link to="/">Login</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link to="/register">Cadastro</Link>
          </Button>
          <Button asChild>
            <Link to="/dashboard">Painel</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
