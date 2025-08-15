# Helprs MVP Database Documentation

## Table of Contents
1. [Overview](#overview)
2. [Entity Relationship Diagram](#entity-relationship-diagram)
3. [Database Schema](#database-schema)
4. [Business Rules](#business-rules)
5. [API Endpoints](#api-endpoints)
6. [Security & RLS Policies](#security--rls-policies)
7. [Data Flow](#data-flow)
8. [Performance Considerations](#performance-considerations)

## Overview

Helprs is a multi-tenant SaaS platform for managing hourly workers and contractors. The database is designed with PostgreSQL using Supabase, implementing Row Level Security (RLS) for tenant isolation.

### Key Design Principles
- **Multi-tenant Architecture**: Company-based data isolation
- **Scalability**: Support for unlimited workers/customers per company
- **Security**: Row Level Security (RLS) policies
- **Flexibility**: Customizable forms, calendars, and roles
- **Real-time**: Notifications and live updates

## Entity Relationship Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│    companies    │    │      users      │    │     workers     │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ id (PK)         │    │ id (PK)         │    │ id (PK)         │
│ name            │    │ email           │    │ user_id (FK)    │
│ subdomain       │    │ company_id (FK) │    │ company_id (FK) │
│ subscription_tier│   │ role            │    │ first_name      │
│ created_at      │    │ created_at      │    │ last_name       │
│ updated_at      │    │ updated_at      │    │ phone           │
└─────────────────┘    └─────────────────┘    │ is_lead         │
         │                       │            │ points          │
         │                       │            │ created_at      │
         │                       │            │ updated_at      │
         │                       │            └─────────────────┘
         │                       │                     │
         │                       │                     │
         ▼                       ▼                     ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│    customers    │    │    calendars    │    │  worker_roles   │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ id (PK)         │    │ id (PK)         │    │ id (PK)         │
│ company_id (FK) │    │ company_id (FK) │    │ company_id (FK) │
│ first_name      │    │ name            │    │ name            │
│ last_name       │    │ description     │    │ hourly_rate     │
│ email           │    │ created_at      │    │ created_at      │
│ phone           │    │ updated_at      │    │ updated_at      │
│ address         │    └─────────────────┘    └─────────────────┘
│ created_at      │             │
│ updated_at      │             │
└─────────────────┘             │
                                ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ appointment_types│    │      forms      │    │   form_fields   │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ id (PK)         │    │ id (PK)         │    │ id (PK)         │
│ calendar_id (FK)│    │ company_id (FK) │    │ form_id (FK)    │
│ name            │    │ name            │    │ field_type      │
│ description     │    │ description     │    │ label           │
│ base_length     │    │ created_at      │    │ required        │
│ minimum_price   │    │ updated_at      │    │ order_index     │
│ form_id (FK)    │    └─────────────────┘    │ created_at      │
│ created_at      │             ▲             │ updated_at      │
│ updated_at      │             │             └─────────────────┘
└─────────────────┘             │
                                │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│      jobs       │    │   job_workers   │    │  time_entries   │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ id (PK)         │    │ id (PK)         │    │ id (PK)         │
│ company_id (FK) │    │ job_id (FK)     │    │ job_id (FK)     │
│ calendar_id (FK)│    │ worker_id (FK)  │    │ worker_id (FK)  │
│ customer_id (FK)│    │ hourly_rate     │    │ clock_in        │
│ title           │    │ assigned_at     │    │ clock_out       │
│ description     │    │ created_at      │    │ hours_worked    │
│ scheduled_date  │    │ updated_at      │    │ created_at      │
│ scheduled_time  │    └─────────────────┘    │ updated_at      │
│ status          │             │             └─────────────────┘
│ total_price     │             │
│ created_at      │             │
│ updated_at      │             │
└─────────────────┘             │
                                ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│    payments     │    │     ratings     │    │ form_responses  │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ id (PK)         │    │ id (PK)         │    │ id (PK)         │
│ job_id (FK)     │    │ job_id (FK)     │    │ job_id (FK)     │
│ worker_id (FK)  │    │ from_worker_id  │    │ form_id (FK)    │
│ amount          │    │ to_worker_id    │    │ responses       │
│ status          │    │ customer_id     │    │ created_at      │
│ stripe_payment_id│   │ rating          │    │ updated_at      │
│ created_at      │    │ comment         │    └─────────────────┘
│ updated_at      │    │ created_at      │
└─────────────────┘    │ updated_at      │
                       └─────────────────┘
```

## Database Schema

### Core Tables

#### companies
Multi-tenant foundation table for company isolation.

```sql
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  subdomain VARCHAR(100) UNIQUE NOT NULL,
  subscription_tier subscription_tier_enum DEFAULT 'basic',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### users
Authentication and role management.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  role user_role_enum NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### workers
Extended user profiles for workers.

```sql
CREATE TABLE workers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  is_lead BOOLEAN DEFAULT FALSE,
  points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Business Logic Tables

#### jobs
Scheduled work assignments.

```sql
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  calendar_id UUID REFERENCES calendars(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  status job_status_enum DEFAULT 'open',
  total_price DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### time_entries
Clock in/out tracking.

```sql
CREATE TABLE time_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  worker_id UUID REFERENCES workers(id) ON DELETE CASCADE,
  clock_in TIMESTAMP WITH TIME ZONE NOT NULL,
  clock_out TIMESTAMP WITH TIME ZONE,
  hours_worked DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Business Rules

### Multi-Tenant Isolation
1. **Company Separation**: All data is isolated by `company_id`
2. **User Access**: Users can only access data from their company
3. **Cross-Company Prevention**: No data leakage between companies

### Authentication & Authorization
1. **Role-Based Access**:
   - Super Admin: Full access to all companies
   - Org Admin: Full access to their company
   - Worker: Limited access to assigned jobs

2. **User Management**:
   - Workers must be associated with a company
   - Email addresses must be unique
   - Phone numbers are optional but recommended

### Job Management
1. **Job Lifecycle**:
   - Open → Scheduling → Scheduled → In Progress → Completed → Paid
   - Jobs cannot be deleted once workers are assigned
   - Status changes trigger notifications

2. **Worker Assignment**:
   - Multiple workers per job
   - Lead worker designation
   - Hourly rates set per assignment

### Payment Workflow
1. **Payment Process**:
   - Customer approves hours and pricing
   - Workers rate each other and customer
   - Disputes notify Org Admin
   - Stripe Connect for payouts

2. **Pricing**:
   - Base price + hourly rates
   - Minimum hours guaranteed
   - Points system: $1 = 3 points, 1 hour = 6 points

### Rating System
1. **Worker-to-Worker**: Professionalism, communication, timeliness
2. **Worker-to-Customer**: Communication, friendliness, difficulty
3. **Customer-to-Worker**: Timeliness, professionalism, communication
4. **Overall**: 5-star rating with optional comments

## API Endpoints

### Authentication
```
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
POST /api/auth/magic-link
```

### Companies
```
GET    /api/companies
POST   /api/companies
GET    /api/companies/:id
PUT    /api/companies/:id
DELETE /api/companies/:id
```

### Users
```
GET    /api/users
POST   /api/users
GET    /api/users/:id
PUT    /api/users/:id
DELETE /api/users/:id
```

### Workers
```
GET    /api/workers
POST   /api/workers
GET    /api/workers/:id
PUT    /api/workers/:id
DELETE /api/workers/:id
GET    /api/workers/:id/availability
PUT    /api/workers/:id/availability
```

### Jobs
```
GET    /api/jobs
POST   /api/jobs
GET    /api/jobs/:id
PUT    /api/jobs/:id
DELETE /api/jobs/:id
POST   /api/jobs/:id/assign
POST   /api/jobs/:id/clock-in
POST   /api/jobs/:id/clock-out
```

### Payments
```
GET    /api/payments
POST   /api/payments
GET    /api/payments/:id
PUT    /api/payments/:id
POST   /api/payments/:id/process
```

### Ratings
```
GET    /api/ratings
POST   /api/ratings
GET    /api/ratings/:id
PUT    /api/ratings/:id
```

## Security & RLS Policies

### Row Level Security (RLS)
All tables have RLS enabled with company-based isolation:

```sql
-- Example: Companies table
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can view all companies" ON companies
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'SUPER_ADMIN'
    )
  );

CREATE POLICY "Users can view their own company" ON companies
  FOR ALL USING (
    id = (
      SELECT company_id FROM users 
      WHERE users.id = auth.uid()
    )
  );
```

### Authentication
- JWT tokens for API access
- Magic links for worker invitations
- Google OAuth integration
- Session management with refresh tokens

### Data Protection
- All sensitive data encrypted at rest
- API rate limiting
- Input validation and sanitization
- Audit logging for critical operations

## Data Flow

### Job Creation Flow
1. Org Admin creates job in calendar
2. Job appears in worker's available jobs
3. Worker accepts or admin assigns
4. Job moves to "Scheduled" status
5. Notifications sent to all parties

### Payment Flow
1. Worker clocks out
2. Lead worker confirms hours
3. Workers rate each other
4. Customer confirms and rates
5. Payment processed via Stripe
6. Points awarded to workers

### Notification Flow
1. Real-time updates via WebSockets
2. Email notifications via SendGrid
3. SMS notifications via Twilio
4. Push notifications via Expo

## Performance Considerations

### Indexes
```sql
-- Company-based queries
CREATE INDEX idx_users_company_id ON users(company_id);
CREATE INDEX idx_workers_company_id ON workers(company_id);
CREATE INDEX idx_jobs_company_id ON jobs(company_id);

-- Job scheduling
CREATE INDEX idx_jobs_scheduled_date ON jobs(scheduled_date);
CREATE INDEX idx_jobs_status ON jobs(status);

-- Payment tracking
CREATE INDEX idx_payments_job_id ON payments(job_id);
CREATE INDEX idx_time_entries_job_id ON time_entries(job_id);

-- User authentication
CREATE INDEX idx_users_email ON users(email);
```

### Query Optimization
- Use prepared statements
- Implement connection pooling
- Cache frequently accessed data
- Paginate large result sets

### Scalability
- Horizontal scaling with read replicas
- Database partitioning by company
- CDN for static assets
- Microservices architecture for future growth

---

**Document Version**: 1.0  
**Last Updated**: January 2025  
**Maintained By**: Helprs Development Team

