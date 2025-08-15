// Create Today's Sprint Issues - Authentication & Frontend Development
const LINEAR_API_KEY = 'lin_api_A1OQDQdRzZC5IBjP71GSHBSlPY34zD2buaxBlhCi';
const TEAM_ID = '2acfa215-9425-4516-b025-3a846b11111c';
const PROJECT_ID = 'd086ebbe-ab52-47aa-8aaa-0751c4630a02';

async function createTodaySprintIssues() {
  try {
    console.log('🚀 CREATING TODAY\'S SPRINT ISSUES...\n');
    
    const headers = {
      'Authorization': LINEAR_API_KEY,
      'Content-Type': 'application/json'
    };
    
    // Get workflow states
    const statesResponse = await fetch('https://api.linear.app/graphql', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        query: `
          query {
            workflowStates {
              nodes {
                id
                name
                type
              }
            }
          }
        `
      })
    });
    
    const statesData = await statesResponse.json();
    const todoState = statesData.data.workflowStates.nodes.find(s => s.name === 'Todo' || s.name === 'Backlog');
    
    console.log(`✅ Found Todo state: ${todoState.name} (${todoState.id})`);
    
    // Today's sprint issues
    const sprintIssues = [
      // PHASE I: Foundation
      {
        title: 'Set Up Next.js Project with Supabase Integration',
        description: `Phase I - Foundation (Day 1-2)
        
**Tasks:**
- Initialize Next.js 14 project with App Router
- Install and configure Supabase client
- Set up environment variables
- Configure TypeScript and ESLint
- Install UI dependencies (Tailwind CSS, shadcn/ui)
- Set up project structure and folders
- Configure build and development scripts

**Deliverables:**
- Working Next.js project
- Supabase client integration
- Basic project structure
- Development environment ready`,
        priority: 'High',
        estimate: 4
      },
      {
        title: 'Create Basic Authentication Components',
        description: `Phase I - Foundation (Day 1-2)
        
**Tasks:**
- Create login form component
- Create signup form component
- Create password reset component
- Create magic link component
- Build auth context and hooks
- Create auth loading states
- Add form validation

**Deliverables:**
- Reusable auth components
- Auth context for state management
- Form validation
- Loading and error states`,
        priority: 'High',
        estimate: 6
      },
      {
        title: 'Implement Authentication Middleware & Route Protection',
        description: `Phase I - Foundation (Day 1-2)
        
**Tasks:**
- Create auth middleware for API routes
- Implement route protection for pages
- Set up role-based access control
- Create auth guards for components
- Handle auth state persistence
- Implement logout functionality
- Add session refresh logic

**Deliverables:**
- Protected API routes
- Protected page routes
- Role-based access control
- Session management`,
        priority: 'High',
        estimate: 4
      },
      {
        title: 'Build Basic Layout Components',
        description: `Phase I - Foundation (Day 1-2)
        
**Tasks:**
- Create main layout component
- Build header/navigation component
- Create sidebar component
- Build footer component
- Create loading spinner component
- Build error boundary component
- Create responsive design

**Deliverables:**
- Reusable layout components
- Responsive design
- Loading and error states
- Navigation structure`,
        priority: 'Medium',
        estimate: 3
      },
      
      // PHASE II: Core Auth Flows
      {
        title: 'Implement User Registration Flow',
        description: `Phase II - Core Auth Flows (Day 2-3)
        
**Tasks:**
- Create company registration form
- Build user registration flow
- Implement email verification
- Create welcome/onboarding flow
- Add profile completion steps
- Handle registration errors
- Create success states

**Deliverables:**
- Complete registration flow
- Email verification
- User onboarding
- Error handling`,
        priority: 'High',
        estimate: 5
      },
      {
        title: 'Build Company Onboarding System',
        description: `Phase II - Core Auth Flows (Day 2-3)
        
**Tasks:**
- Create company setup wizard
- Build subdomain selection
- Implement subscription tier selection
- Create initial settings setup
- Add company profile creation
- Handle onboarding completion
- Create onboarding progress tracking

**Deliverables:**
- Company onboarding wizard
- Subdomain setup
- Initial configuration
- Progress tracking`,
        priority: 'High',
        estimate: 6
      },
      {
        title: 'Create Role-Based Dashboard Access',
        description: `Phase II - Core Auth Flows (Day 2-3)
        
**Tasks:**
- Build Super Admin dashboard
- Create Org Admin dashboard
- Build Worker dashboard
- Implement role-based navigation
- Create dashboard routing
- Add role-specific features
- Handle unauthorized access

**Deliverables:**
- Role-specific dashboards
- Role-based navigation
- Access control
- Dashboard routing`,
        priority: 'High',
        estimate: 5
      },
      {
        title: 'Implement User Invitation System',
        description: `Phase II - Core Auth Flows (Day 2-3)
        
**Tasks:**
- Create invitation form
- Build email invitation system
- Implement invitation acceptance
- Create role assignment
- Handle invitation expiration
- Add invitation management
- Create invitation tracking

**Deliverables:**
- Invitation system
- Email notifications
- Role assignment
- Invitation management`,
        priority: 'Medium',
        estimate: 4
      },
      {
        title: 'Set Up Session Management',
        description: `Phase II - Core Auth Flows (Day 2-3)
        
**Tasks:**
- Implement session persistence
- Create session refresh logic
- Handle session expiration
- Build session monitoring
- Add logout functionality
- Create session security
- Implement session cleanup

**Deliverables:**
- Session persistence
- Auto-refresh logic
- Security features
- Logout handling`,
        priority: 'Medium',
        estimate: 3
      },
      
      // PHASE III: Basic UI + Auth Integration
      {
        title: 'Create Dashboard Layouts for Each Role',
        description: `Phase III - Basic UI + Auth Integration (Day 3-4)
        
**Tasks:**
- Design Super Admin layout
- Build Org Admin layout
- Create Worker layout
- Implement responsive design
- Add navigation menus
- Create breadcrumbs
- Build layout components

**Deliverables:**
- Role-specific layouts
- Responsive design
- Navigation system
- Layout components`,
        priority: 'High',
        estimate: 4
      },
      {
        title: 'Build Navigation & Sidebar System',
        description: `Phase III - Basic UI + Auth Integration (Day 3-4)
        
**Tasks:**
- Create main navigation
- Build sidebar component
- Implement menu items
- Add active state handling
- Create mobile navigation
- Build breadcrumb system
- Add navigation helpers

**Deliverables:**
- Navigation system
- Sidebar component
- Mobile navigation
- Breadcrumb system`,
        priority: 'Medium',
        estimate: 3
      },
      {
        title: 'Implement User Profile Management',
        description: `Phase III - Basic UI + Auth Integration (Day 3-4)
        
**Tasks:**
- Create profile page
- Build profile editing
- Add avatar upload
- Implement settings page
- Create password change
- Add notification preferences
- Build profile validation

**Deliverables:**
- Profile management
- Settings page
- Avatar upload
- Preferences`,
        priority: 'Medium',
        estimate: 4
      },
      {
        title: 'Create Company Settings Interface',
        description: `Phase III - Basic UI + Auth Integration (Day 3-4)
        
**Tasks:**
- Build company settings page
- Create subscription management
- Add company profile editing
- Implement billing interface
- Create team management
- Add company preferences
- Build settings validation

**Deliverables:**
- Company settings
- Subscription management
- Team management
- Billing interface`,
        priority: 'Medium',
        estimate: 5
      },
      {
        title: 'Implement Basic CRUD Operations with Auth',
        description: `Phase III - Basic UI + Auth Integration (Day 3-4)
        
**Tasks:**
- Create API routes with auth
- Build CRUD components
- Implement data fetching
- Add error handling
- Create loading states
- Build form components
- Add validation

**Deliverables:**
- Authenticated API routes
- CRUD operations
- Form components
- Error handling`,
        priority: 'High',
        estimate: 6
      }
    ];
    
    console.log('📋 Creating sprint issues...');
    
    const createdIssues = [];
    
    for (const issueData of sprintIssues) {
      try {
        const createResponse = await fetch('https://api.linear.app/graphql', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            query: `
              mutation {
                issueCreate(
                  input: {
                    teamId: "${TEAM_ID}"
                    projectId: "${PROJECT_ID}"
                    title: "${issueData.title}"
                    description: "${issueData.description}"
                    priority: ${issueData.priority === 'High' ? 2 : 1}
                    stateId: "${todoState.id}"
                    estimate: ${issueData.estimate}
                  }
                ) {
                  success
                  issue {
                    id
                    title
                    identifier
                    estimate
                  }
                }
              }
            `
          })
        });
        
        const createData = await createResponse.json();
        
        if (createData.data?.issueCreate?.success) {
          const issue = createData.data.issueCreate.issue;
          createdIssues.push(issue);
          console.log(`✅ Created: ${issue.title} (${issue.identifier}) - ${issueData.estimate}h`);
        } else {
          console.log(`❌ Failed to create: ${issueData.title}`);
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.log(`❌ Error creating ${issueData.title}: ${error.message}`);
      }
    }
    
    console.log('\n🎉 SPRINT ISSUES CREATED!');
    console.log('==========================');
    console.log(`📊 Total issues created: ${createdIssues.length}`);
    
    // Calculate total hours
    const totalHours = createdIssues.reduce((sum, issue) => sum + (issue.estimate || 0), 0);
    console.log(`⏱️ Total estimated hours: ${totalHours}h`);
    
    // Show summary by phase
    console.log('\n📋 Sprint Summary:');
    console.log('==================');
    console.log('Phase I - Foundation (Day 1-2):');
    console.log('  - Next.js Setup (4h)');
    console.log('  - Auth Components (6h)');
    console.log('  - Auth Middleware (4h)');
    console.log('  - Layout Components (3h)');
    console.log('  Total: 17h');
    
    console.log('\nPhase II - Core Auth Flows (Day 2-3):');
    console.log('  - User Registration (5h)');
    console.log('  - Company Onboarding (6h)');
    console.log('  - Role-Based Dashboards (5h)');
    console.log('  - User Invitations (4h)');
    console.log('  - Session Management (3h)');
    console.log('  Total: 23h');
    
    console.log('\nPhase III - UI + Auth Integration (Day 3-4):');
    console.log('  - Dashboard Layouts (4h)');
    console.log('  - Navigation System (3h)');
    console.log('  - Profile Management (4h)');
    console.log('  - Company Settings (5h)');
    console.log('  - CRUD Operations (6h)');
    console.log('  Total: 22h');
    
    console.log(`\n🎯 GRAND TOTAL: ${totalHours}h (${Math.ceil(totalHours/8)} days)`);
    
  } catch (error) {
    console.error('❌ Error creating sprint issues:', error.message);
  }
}

createTodaySprintIssues();

