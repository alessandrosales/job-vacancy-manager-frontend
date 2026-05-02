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
  const [phone, setPhone] = React.useState(user.phone)
  const [avatar, setAvatar] = React.useState(user.avatar)
  const [bio, setBio] = React.useState(user.bio)
  const [age, setAge] = React.useState(user.age)
  const [fullAddress, setFullAddress] = React.useState(user.full_address)
  const [relationshipStatus, setRelationshipStatus] = React.useState(
    user.relationship_status
  )
  const [gender, setGender] = React.useState(user.gender)

  React.useEffect(() => {
    setName(user.name)
    setEmail(user.email)
    setPhone(user.phone)
    setAvatar(user.avatar)
    setBio(user.bio)
    setAge(user.age)
    setFullAddress(user.full_address)
    setRelationshipStatus(user.relationship_status)
    setGender(user.gender)
  }, [user])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    updateUser({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      avatar: avatar.trim(),
      bio: bio.trim(),
      age: age.trim(),
      full_address: fullAddress.trim(),
      relationship_status: relationshipStatus.trim(),
      gender: gender.trim(),
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
                  <FieldLabel htmlFor="profile-phone">Phone</FieldLabel>
                  <Input
                    id="profile-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    autoComplete="tel"
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
                <Field>
                  <FieldLabel htmlFor="profile-age">Age</FieldLabel>
                  <Input
                    id="profile-age"
                    inputMode="numeric"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    autoComplete="off"
                    placeholder="e.g. 32"
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="profile-address">Full address</FieldLabel>
                  <Textarea
                    id="profile-address"
                    value={fullAddress}
                    onChange={(e) => setFullAddress(e.target.value)}
                    rows={3}
                    autoComplete="street-address"
                    placeholder="Street, number, city, postal code"
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="profile-relationship">
                    Relationship status
                  </FieldLabel>
                  <Input
                    id="profile-relationship"
                    value={relationshipStatus}
                    onChange={(e) => setRelationshipStatus(e.target.value)}
                    autoComplete="off"
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="profile-gender">Gender</FieldLabel>
                  <Input
                    id="profile-gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    autoComplete="sex"
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
