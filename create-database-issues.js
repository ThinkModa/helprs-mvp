// Create Database Schema Issues in Linear
const { LinearClient } = require('@linear/sdk');

const LINEAR_API_KEY = 'lin_api_A1OQDQdRzZC5IBjP71GSHBSlPY34zD2buaxBlhCi';
const TEAM_ID = '2acfa215-9425-4516-b025-3a846b11111c';
const PROJECT_ID = 'd086ebbe-ab52-47aa-8aaa-0751c4630a02';

const linear = new LinearClient({ apiKey: LINEAR_API_KEY });

// Detailed database schema issues based on our work
const databaseIssues = [
  {
    title: 'Design Multi-Tenant Database Architecture',
    description: `Design the core database architecture for multi-tenant SaaS platform:
    
**Requirements:**
- Company isolation with company_id foreign keys
- Row Level Security (RLS) policies for data separation
- Support for unlimited workers/customers per company
- Scalable design for future features (AI, analytics, customer app)

**Tables to Design:**
- companies (multi-tenant foundation)
- users (authentication & roles)
- workers (extended user profiles)
- customers (company-specific)
- calendars (flexible organization)
- worker_roles (company-specific roles)
- forms & form_fields (custom forms)
- appointment_types (service definitions)
- jobs (scheduled work)
- time_entries (clock in/out)
- payments (worker payouts & customer payments)
- ratings (worker/customer feedback)`,
    priority: 'High',
    estimate: 8,
    labels: ['database', 'architecture', 'multi-tenant']
  },
  {
    title: 'Create Database Migration Files',
    description: `Create proper migration files for Supabase deployment:

**Tasks:**
- Create initial migration file with complete schema
- Include all table definitions with proper relationships
- Add indexes for performance optimization
- Include enum types (user_role, subscription_tier, job_status, etc.)
- Add RLS policies in migration
- Test migration on local Docker environment
- Deploy to remote Supabase project

**Files to Create:**
- supabase/migrations/YYYYMMDDHHMMSS_initial_schema.sql
- Include all CREATE TABLE statements
- Include all CREATE INDEX statements
- Include all RLS policies`,
    priority: 'High',
    estimate: 4,
    labels: ['database', 'migrations', 'supabase']
  },
  {
    title: 'Implement Row Level Security (RLS) Policies',
    description: `Implement comprehensive RLS policies for multi-tenant isolation:

**Security Requirements:**
- Company-based data isolation
- Role-based access control (Super Admin, Org Admin, Worker)
- User authentication checks in all policies
- Proper foreign key relationships enforced

**Policies to Implement:**
- Companies: Super Admin full access, company isolation
- Users: Company-based access, role-based permissions
- Workers: Company isolation, user relationship checks
- Customers: Company isolation
- Calendars: Company isolation
- Jobs: Company isolation, worker assignment checks
- Payments: Job-based isolation
- Ratings: Job-based isolation

**Testing:**
- Verify company A cannot see company B data
- Verify workers only see their assigned jobs
- Verify admins only see their company data`,
    priority: 'High',
    estimate: 6,
    labels: ['security', 'database', 'rls']
  },
  {
    title: 'Create Database Test Suite',
    description: `Create comprehensive test suite for database operations:

**Test Categories:**
1. Company Creation & Isolation
   - Create multiple companies
   - Verify data separation
   - Test RLS policies

2. User Authentication & Roles
   - Create users with different roles
   - Test role-based permissions
   - Verify company associations

3. Worker Management
   - Create workers and assign roles
   - Set availability schedules
   - Test lead worker assignments

4. Job Scheduling
   - Create calendars and appointment types
   - Schedule jobs with workers
   - Test job status workflows

5. Payment Workflows
   - Create time entries
   - Process worker payments
   - Test payment status tracking

6. Rating System
   - Test worker-to-worker ratings
   - Verify rating calculations
   - Test multi-tenant isolation

**Test Data:**
- Create seed.sql with comprehensive test data
- Test all CRUD operations
- Verify data integrity and relationships`,
    priority: 'High',
    estimate: 4,
    labels: ['testing', 'database', 'crud']
  },
  {
    title: 'Create Database Documentation',
    description: `Create comprehensive database documentation:

**Documentation Requirements:**
1. Entity Relationship Diagram (ERD)
   - Visual representation of all tables
   - Show relationships and cardinality
   - Include foreign key relationships

2. Data Model Documentation
   - Table descriptions and purposes
   - Field definitions and constraints
   - Business rules and validations

3. API Endpoint Specifications
   - List required API endpoints
   - Define request/response formats
   - Document authentication requirements

4. Business Rules Documentation
   - Multi-tenant isolation rules
   - Role-based access control
   - Payment workflow rules
   - Rating system rules

5. Database Schema Reference
   - Complete table definitions
   - Index descriptions
   - RLS policy documentation

**Deliverables:**
- ERD diagram (PNG/PDF)
- API specification document
- Database schema reference
- Business rules documentation`,
    priority: 'Medium',
    estimate: 3,
    labels: ['documentation', 'database', 'api']
  },
  {
    title: 'Set Up Local Development Environment',
    description: `Configure local development environment with Docker:

**Environment Setup:**
- Install and configure Supabase CLI
- Set up local Docker containers
- Configure separate ports for multiple projects
- Link to remote Supabase project

**Configuration Tasks:**
- Create supabase/config.toml with custom ports
- Configure database, API, Studio, and Inbucket ports
- Test local database connection
- Verify schema synchronization

**Port Configuration:**
- API: 54331 (instead of 54321)
- Database: 54332 (instead of 54322)
- Studio: 54333 (instead of 54323)
- Inbucket: 54334 (instead of 54324)
- Analytics: 54337 (instead of 54327)

**Testing:**
- Verify local database starts correctly
- Test schema deployment
- Verify remote synchronization`,
    priority: 'High',
    estimate: 2,
    labels: ['setup', 'docker', 'local-dev']
  },
  {
    title: 'Implement Database Indexes for Performance',
    description: `Create database indexes for optimal query performance:

**Index Requirements:**
- Company-based queries (company_id)
- User authentication (email, company_id)
- Worker assignments (worker_id, company_id)
- Job scheduling (scheduled_date, status)
- Payment tracking (job_id, worker_id)
- Rating queries (job_id, from_worker_id)

**Indexes to Create:**
- idx_users_company_id ON users(company_id)
- idx_users_email ON users(email)
- idx_workers_company_id ON workers(company_id)
- idx_jobs_company_id ON jobs(company_id)
- idx_jobs_scheduled_date ON jobs(scheduled_date)
- idx_jobs_status ON jobs(status)
- idx_payments_job_id ON payments(job_id)
- idx_time_entries_job_id ON time_entries(job_id)

**Performance Testing:**
- Test query performance with large datasets
- Verify index usage with EXPLAIN ANALYZE
- Monitor query execution times`,
    priority: 'Medium',
    estimate: 2,
    labels: ['performance', 'database', 'indexes']
  }
];

async function createDatabaseIssues() {
  try {
    console.log('🔗 Connecting to Linear...');
    
    // Get workflow states
    const states = await linear.workflowStates();
    const todoState = states.nodes.find(s => s.name === 'To Do' || s.name === 'Backlog');
    
    console.log('📋 Creating database schema issues...');
    
    // Create each database issue
    for (const issueData of databaseIssues) {
      const issue = await linear.createIssue({
        teamId: TEAM_ID,
        projectId: PROJECT_ID,
        title: issueData.title,
        description: issueData.description,
        priority: issueData.priority === 'High' ? 2 : 1,
        stateId: todoState.id,
        estimate: issueData.estimate
      });
      
      console.log(`✅ Created: ${issue.title} (${issue.identifier})`);
    }
    
    console.log('\n🎉 Database schema issues created successfully!');
    console.log(`📊 Total issues created: ${databaseIssues.length}`);
    
    // Show summary
    console.log('\n📋 Created Issues:');
    console.log('==================');
    databaseIssues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue.title} (${issue.priority} priority, ${issue.estimate}h)`);
    });
    
  } catch (error) {
    console.error('❌ Error creating database issues:', error.message);
  }
}

createDatabaseIssues();

