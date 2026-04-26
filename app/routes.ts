import { type RouteConfig, index, route } from "@react-router/dev/routes"

export default [
  index("routes/login.tsx"),
  route("home", "routes/home.tsx"),
  route("register", "routes/register.tsx"),
  route("recover-password", "routes/recover-password.tsx"),
  route("dashboard", "routes/dashboard.tsx"),
  route("opportunities/opportunity/:id?", "routes/opportunity.tsx"),
  route("opportunities/statuses", "routes/opportunity-statuses.tsx"),
  route("opportunities/status/:id?", "routes/opportunity-status.tsx"),
  route("opportunities", "routes/opportunities.tsx"),
  route("companies/company/:id?", "routes/company.tsx"),
  route("companies", "routes/companies.tsx"),
  route("roles/role/:id?", "routes/role.tsx"),
  route("roles", "routes/roles.tsx"),
  route("skills/skill/:id?", "routes/skill.tsx"),
  route("skills", "routes/skills.tsx"),
  route("my-data", "routes/my-data.tsx"),
] satisfies RouteConfig
