# Fabi Nails API Documentation

## Base URL
`http://localhost:3000/api`

## Authentication
- Admin routes use NextAuth.js session cookie (`next-auth.session-token`)
- Login via `POST /api/auth/callback/credentials` (form: `username` + `password`, env `ADMIN_USER` / `ADMIN_PASSWORD_HASH`)
- Páginas `/admin` e `GET /api/appointments` + `DELETE /api/appointments/:id` exigem sessão; `POST /api/appointments` e `GET /api/appointments/available` são públicos
- Em produção, defina `NEXTAUTH_SECRET` (32+ bytes base64) e `ADMIN_PASSWORD_HASH` (bcrypt 12)

## Errors
Standard error format: `{ error: { code, message } }`
- 400: Bad request (validation error)
- 401: Unauthorized (invalid/missing token)
- 403: Forbidden (insufficient permissions)
- 404: Not found
- 409: Conflict (duplicate appointment)
- 422: Validation error
- 500: Internal server error

## Endpoints

### Services

#### GET /api/services
List all fixed services.

**Response:**
```json
[
  {
    "id": "string",
    "name": "Alongamento",
    "price": 150,
    "duration": 2
  },
  {
    "id": "string",
    "name": "Manutenção",
    "price": 100,
    "duration": 2
  },
  {
    "id": "string",
    "name": "Banho de Gel",
    "price": 100,
    "duration": 2
  }
]
```

### Appointments

#### POST /api/appointments
Create a new appointment. Valida `serviceId` existente, `date` `YYYY-MM-DD` não passada, `time` pertencente aos slots do dia (`08:00,10:00,12:00,14:00,16:00` seg-qui/sex, `08:00,10:00` sáb, domingo fechado). Bloqueia sobreposição (duration 2h) e retorna `409` em conflito (constraint `@@unique([date,time])`).

**Input:**
```json
{
  "clientName": "Maria Silva",
  "clientWhatsapp": "+5543996524776",
  "serviceId": "clx...cuid",
  "date": "2026-08-25",
  "time": "10:00"
}
```

**Response `201`:**
```json
{
  "appointment": { "id": "...", "clientName": "...", "service": { "name": "Alongamento" }, "date": "2026-08-25", "time": "10:00", "createdAt": "..." },
  "notificationUrl": "https://wa.me/5543996524776?text=..."
}
```

#### GET /api/appointments
List all appointments (admin only, supports pagination).

**Query params:** `page` (default: 1), `pageSize` (default: 20)

**Response:**
```json
{
  "appointments": [
    {
      "id": "string",
      "clientName": "Maria Silva",
      "clientWhatsapp": "+5543996524776",
      "serviceName": "Alongamento",
      "date": "2024-01-15",
      "time": "09:00",
      "createdAt": "2024-01-15T09:00:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "pageSize": 20
}
```

#### GET /api/appointments/available
Public. Returns free slots for a month.

**Query:** `month=YYYY-MM` (obrigatório)

**Response `200`:** `{ "2026-08-25": ["08:00","10:00"], ... }` — apenas dias futuros com slots livres; hoje filtra horários já passados. Header `Cache-Control: public, s-maxage=60`.

#### DELETE /api/appointments/:id
Admin only. Cancels appointment.

**Response `200`:** `{ "deleted": true, "id": "..." }` — `404` se já removido.

### Testimonials

#### POST /api/testimonials
Public. Cria depoimento em estado `pending` (moderação). Valida `name` 2-50 chars, `text` 10-500 chars, `rating` 1-5 int.

**Input:**
```json
{ "name": "Ana", "text": "Amei, unhas perfeitas!", "rating": 5 }
```

**Response `201`:**
```json
{ "testimonial": { "id": "...", "name": "Ana", "text": "Amei...", "rating": 5, "status": "pending", "createdAt": "..." } }
```

Errors: `400` validation, `422` invalid, `500`.

#### GET /api/testimonials
Public. Retorna só `approved`, limitado aos 3 mais recentes (ordem `createdAt desc`). Se nenhum aprovado, retorna `[]` (seção oculta no front).

**Response `200`:**
```json
{ "testimonials": [{ "id": "...", "name": "Ana", "text": "...", "rating": 5, "createdAt": "..." }] }
```

#### GET /api/testimonials?status=pending (admin)
Admin only. Lista pendentes para moderação (paginado `page`, `pageSize`). Também suporta `status=approved|rejected`.

**Headers:** requer sessão NextAuth (`role: admin`). `401` se não logado, `403` se não admin.

#### PATCH /api/testimonials/:id
Admin only. Aprova ou rejeita.

**Input:**
```json
{ "status": "approved" } // ou "rejected" | "pending"
```

**Response `200`:** `{ "testimonial": { "id": "...", "status": "approved" } }` — `404` se não encontrado, `422` se status inválido.