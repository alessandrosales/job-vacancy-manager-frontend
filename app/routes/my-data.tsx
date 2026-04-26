import * as React from "react"
import { useNavigate } from "react-router"

import { AppLayout } from "~/components/layout/app-layout"
import { useSessionUser } from "~/components/providers/session-user-provider"
import { Button } from "~/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { Textarea } from "~/components/ui/textarea"

export default function MyDataPage() {
  const navigate = useNavigate()
  const { user, updateUser } = useSessionUser()

  const [name, setName] = React.useState(user.name)
  const [email, setEmail] = React.useState(user.email)
  const [avatar, setAvatar] = React.useState(user.avatar)
  const [bio, setBio] = React.useState(user.bio)

  React.useEffect(() => {
    setName(user.name)
    setEmail(user.email)
    setAvatar(user.avatar)
    setBio(user.bio)
  }, [user])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    updateUser({
      name: name.trim(),
      email: email.trim(),
      avatar: avatar.trim(),
      bio: bio.trim(),
    })
  }

  return (
    <AppLayout
      title="My data"
      breadcrumbs={[
        { label: "Dashboard", to: "/dashboard" },
        { label: "My data" },
      ]}
    >
      <div className="min-h-0 flex-1 overflow-y-auto">
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle>My data</CardTitle>
            <CardDescription>
              View and update the information shown in the account menu in the
              sidebar.
            </CardDescription>
          </CardHeader>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4"
          >
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="profile-name">Full name</FieldLabel>
                  <Input
                    id="profile-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="profile-email">Email</FieldLabel>
                  <Input
                    id="profile-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="profile-avatar">Avatar URL</FieldLabel>
                  <Input
                    id="profile-avatar"
                    type="url"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    placeholder="https://"
                  />
                  <FieldDescription>
                    Optional. If empty, initials from your name are used.
                  </FieldDescription>
                </Field>
                <Field>
                  <FieldLabel htmlFor="profile-bio">Bio</FieldLabel>
                  <Textarea
                    id="profile-bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={4}
                    placeholder="Short description about you"
                  />
                </Field>
              </FieldGroup>
            </CardContent>
            <CardFooter className="flex flex-wrap justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
              >
                Cancel
              </Button>
              <Button type="submit">Save changes</Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </AppLayout>
  )
}
