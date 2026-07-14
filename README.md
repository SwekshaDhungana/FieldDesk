# FieldDesk

FieldDesk is a small support desk dashboard for the HGN frontend assignment. The main thing I focused on was access control: platform users can work across organizations, organization users stay inside their own organization, and agents only get the tickets they are allowed to work on.

It is frontend-only and uses mock data, but the important flows are still interactive. Tickets, permissions, staff, and organizations can all be changed during the current browser session.

## Tech Stack

- React
- TypeScript
- Vite
- React Router
- Zustand
- Tailwind CSS
- Recharts
- lucide-react
- Oxlint

## Running The Project

Install dependencies:

```bash
npm install
```

Run the dev server:

```bash
npm run dev
```

Open:

```txt
http://localhost:5173
```

Useful checks:

```bash
npm run lint
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Testing Notes

The easiest way to test the role behavior is the user switcher at the bottom of the sidebar.

- The first dropdown changes the active user.
- Platform users also get a second dropdown for the active organization.
- Selecting "All Organizations" shows platform-wide data when the current role is allowed to see it.

Seeded users:

| User           | Role               | Scope       |
| -------------- | ------------------ | ----------- |
| Anish Bhatta   | Super Admin        | Platform    |
| Sita Sharma    | Auditor            | Platform    |
| Rajesh Hamal   | Organization Admin | Daraz Nepal |
| Priya Thapa    | Team Lead          | Daraz Nepal |
| Bikash Gurung  | Agent              | Daraz Nepal |
| Sunil Shrestha | Organization Admin | Hamro Patro |
| Anita Maharjan | Team Lead          | Hamro Patro |
| Dipak Karki    | Agent              | Hamro Patro |
| Manisha Rai    | Organization Admin | Esewa       |
| Roshan Tamang  | Team Lead          | Esewa       |
| Kabita Poudel  | Agent              | Esewa       |

Seeded organizations:

| Organization | Notes                          |
| ------------ | ------------------------------ |
| Daraz Nepal  | E-commerce support tickets     |
| Hamro Patro  | Calendar/news platform tickets |
| Esewa        | Payment and wallet tickets     |

Things worth checking:

1. Switch to `Anish Bhatta` and check the full platform view.
2. Remove `delete_tickets` from Organization Admin on the Permissions page.
3. Switch to an Organization Admin and check that delete access disappears without refresh.
4. Try opening another organization's ticket URL as an organization-scoped user.
5. Switch to an Agent and check that only assigned/created tickets show.
6. Switch to `Sita Sharma` and check that Auditor stays read-only.

## Permissions Model

Permissions are stored as editable app data. I avoided putting role checks like `user.role === "agent"` directly into pages for normal permission decisions.

The default matrix starts in:

```txt
src/data/mock-data.ts
```

The live permission state is held in:

```txt
src/stores/permission-store.ts
```

The basic shape is:

```ts
type PermissionMatrix = Record<Role, Permission[]>;
```

Example permissions:

```ts
"view_tickets";
"create_tickets";
"edit_tickets";
"assign_tickets";
"delete_tickets";
"view_staff";
"manage_staff";
"view_organizations";
"manage_organizations";
"view_analytics";
"manage_permissions";
```

Most UI checks go through the `usePermissions()` hook:

```ts
const { can } = usePermissions();

can("edit_tickets");
can("manage_staff");
```

Permission changes are made from the Permissions page. When a Super Admin toggles a permission, Zustand updates the matrix and the app reacts immediately. This affects sidebar links, route access, buttons, form fields, and store actions without a page refresh.

I also added permission checks inside the mutation stores. Hiding a delete button is not the only protection; `deleteTicket()` still checks whether the current user has permission and can access that ticket.

## Organization And Access Rules

The organization rules are handled mostly in the stores:

- Super Admin can access all organizations.
- Auditor can view across organizations, but does not get write actions by default.
- Organization Admin and Team Lead are scoped to their own organization.
- Agent is scoped to their own organization and only sees tickets assigned to them or created by them.
- Staff and organization management actions check both permission and organization scope.

This is the part I spent the most time checking, because cross-organization access is the easiest place for this kind of app to go wrong.

## Main Technical Decisions

- I used Zustand because the state is shared across pages, but the app is not large enough to need Redux.
- Permissions live in one store so role behavior can be edited at runtime.
- Ticket, staff, and organization actions validate access inside the stores, not only in the UI.
- The mock API layer is used for seeded data and loading-state simulation.
- The UI uses a darker sidebar and a blue-grey accent direction instead of a plain white admin dashboard.
- Analytics are intentionally simple because the assignment asks for a basic analytics view, not a reporting module.
- Staff and organization management are lightweight, but the main add/edit/status flows work.

## Known Limitations

- Changes are stored in memory only, so tickets, staff, organizations, and permission edits reset after refresh.
- Staff management supports add, edit, activate, and deactivate, but not invitations or password setup.
- Organization management supports add and edit, but not archive/delete.
- Analytics are simple and use the current ticket data only.
- The layout is mainly optimized for desktop review.

## Project Map

```txt
src/
  components/
    common/
    layout/
  data/
  hooks/
  pages/
  stores/
  types/
```
