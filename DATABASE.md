# PulseBoard — Database Schema (ER Diagram)

PostgreSQL via Sequelize ORM. All primary keys are UUIDs. Structured poll questions and response answers are stored as **JSONB** columns to allow flexible, schema-free sub-documents without a separate junction table.

---

## Entity-Relationship Diagram

```mermaid
erDiagram
    users {
        UUID        id              PK
        VARCHAR(50) name            "NOT NULL"
        VARCHAR     email           "NOT NULL UNIQUE"
        VARCHAR     password        "NOT NULL (bcrypt hash)"
        INTEGER     loginAttempts   "DEFAULT 0"
        TIMESTAMP   lockUntil       "NULL — account lockout"
        TIMESTAMP   createdAt
        TIMESTAMP   updatedAt
    }

    polls {
        UUID         id             PK
        VARCHAR(200) title          "NOT NULL"
        TEXT         description    "DEFAULT ''"
        UUID         creatorId      FK
        VARCHAR      shareId        "UNIQUE — public share token"
        JSONB        questions      "Array of question objects"
        BOOLEAN      requireAuth    "DEFAULT false"
        TIMESTAMP    expiresAt      "NOT NULL"
        BOOLEAN      isPublished    "DEFAULT false"
        INTEGER      totalResponses "DEFAULT 0 — denormalised counter"
        TIMESTAMP    createdAt
        TIMESTAMP    updatedAt
    }

    responses {
        UUID      id            PK
        UUID      pollId        FK
        UUID      respondentId  FK "NULL for anonymous"
        BOOLEAN   isAnonymous   "DEFAULT true"
        JSONB     answers       "Array of answer objects"
        TIMESTAMP createdAt
        TIMESTAMP updatedAt
    }

    users  ||--o{ polls     : "creates"
    polls  ||--o{ responses : "receives"
    users  ||--o{ responses : "submits (optional)"
```

---

## JSONB Structures

### `polls.questions` — array of question objects

```jsonc
[
  {
    "_id":       "uuid-v4",         // assigned by backend beforeCreate hook
    "text":      "What is your favourite feature?",
    "isRequired": true,
    "options":   ["Real-time updates", "Poll builder", "Analytics", "Sharing"]
  }
]
```

### `responses.answers` — array of answer objects

```jsonc
[
  {
    "questionId":     "uuid-v4",    // references questions[]._id in the parent poll
    "selectedOption": "Real-time updates"
  }
]
```

---

## Indexes

| Table | Columns | Type | Purpose |
|---|---|---|---|
| `users` | `email` | UNIQUE | Prevent duplicate accounts |
| `polls` | `shareId` | UNIQUE | Fast public-share lookups |
| `responses` | `(pollId, respondentId)` | UNIQUE | Prevent one authenticated user from voting twice (PostgreSQL treats NULL as distinct, so anonymous rows are exempt) |

---

## Sequelize Model Map

| Model | Table | Key relationships |
|---|---|---|
| `User` | `users` | Has many `Poll` (creatorId), has many `Response` (respondentId) |
| `Poll` | `polls` | Belongs to `User` (creatorId), has many `Response` (pollId) |
| `Response` | `responses` | Belongs to `Poll` (pollId), belongs to `User` (respondentId, optional) |

---

## Computed / Virtual Fields

| Model | Field | Logic |
|---|---|---|
| `Poll` | `status` | `isPublished → "published"` · `now > expiresAt → "expired"` · otherwise `"active"` |
| `Poll` | `_id` | Alias for `id` added in `toJSON()` — keeps frontend compatible with object shape |
| `User` | `_id` | Alias for `id` added in `toJSON()` |
| `User` | `isLocked` | `lockUntil !== null && lockUntil > now` |

---

## Local Development (Docker)

```bash
docker run -d \
  --name pulseboard-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=pulseboard \
  -p 5432:5432 \
  --restart unless-stopped \
  postgres:16-alpine
```

Tables are created automatically on first startup via `sequelize.sync()`.

Connection string for `.env`:
```
DATABASE_URL=postgres://postgres:postgres@localhost:5432/pulseboard
```
