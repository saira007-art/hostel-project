# API Endpoints Documentation

Base URL (example): `https://hostel-survival.vercel.app/api`

## Authentication
- **POST** `/auth/signup`
  - Body: `{ name, email, password, room_number }`
  - Description: Register a new student.
- **POST** `/auth/login`
  - Body: `{ email, password }`
  - Description: Authenticate and receive JWT token.

## Complaints
- **GET** `/complaints`
  - Query: `?status=pending` (optional)
  - Description: Retrieve list of complaints (admins see all, users see their own).
- **POST** `/complaints`
  - Body: `{ category, description, room_number }`
  - Header: `Authorization: Bearer <token>`
  - Description: Submit a new complaint.
- **PUT** `/complaints/:id/status`
  - Body: `{ status }` (Admin only)
  - Description: Resolve or update the status of a complaint.

## Item Sharing
- **GET** `/items`
  - Description: List available items.
- **POST** `/items`
  - Body: `{ title, description, item_type, contact_info }`
  - Description: Post a new item for borrowing/selling.

## Laundry
- **GET** `/laundry`
  - Description: Get available laundry slots and current bookings.
- **POST** `/laundry/book`
  - Body: `{ slot_time, machine_number }`
  - Description: Book a laundry slot.

## Dashboard / Notices
- **GET** `/notices`
  - Description: Fetch active notices for the dashboard.
- **POST** `/notices`
  - Body: `{ title, content }` (Admin only)
  - Description: Post a new notice.
