// Create Simplified Sprint Issues
const LINEAR_API_KEY = 'lin_api_A1OQDQdRzZC5IBjP71GSHBSlPY34zD2buaxBlhCi';
const TEAM_ID = '2acfa215-9425-4516-b025-3a846b11111c';
const PROJECT_ID = 'd086ebbe-ab52-47aa-8aaa-0751c4630a02';

async function createSprintIssues() {
  try {
    console.log('🚀 CREATING SIMPLIFIED SPRINT ISSUES...\n');
    
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
    
    // Simplified sprint issues
    const sprintIssues = [
      // PHASE I: Foundation
      {
        title: 'Set Up Next.js Project with Supabase Integration',
        description: 'Initialize Next.js 14 project, install Supabase client, configure environment variables, set up TypeScript and UI dependencies.',
        priority: 'High',
        estimate: 4
      },
      {
        title: 'Create Basic Authentication Components',
        description: 'Build login, signup, password reset, and magic link components with auth context and form validation.',
        priority: 'High',
        estimate: 6
      },
      {
        title: 'Implement Authentication Middleware & Route Protection',
        description: 'Create auth middleware for API routes, implement route protection, set up role-based access control.',
        priority: 'High',
        estimate: 4
      },
      {
        title: 'Build Basic Layout Components',
        description: 'Create main layout, header, sidebar, footer, loading spinner, and error boundary components.',
        priority: 'Medium',
        estimate: 3
      },
      
      // PHASE II: Core Auth Flows
      {
        title: 'Implement User Registration Flow',
        description: 'Create company registration form, user registration flow, email verification, and onboarding.',
        priority: 'High',
        estimate: 5
      },
      {
        title: 'Build Company Onboarding System',
        description: 'Create company setup wizard, subdomain selection, subscription tier selection, and initial settings.',
        priority: 'High',
        estimate: 6
      },
      {
        title: 'Create Role-Based Dashboard Access',
        description: 'Build Super Admin, Org Admin, and Worker dashboards with role-based navigation and access control.',
        priority: 'High',
        estimate: 5
      },
      {
        title: 'Implement User Invitation System',
        description: 'Create invitation form, email invitation system, invitation acceptance, and role assignment.',
        priority: 'Medium',
        estimate: 4
      },
      {
        title: 'Set Up Session Management',
        description: 'Implement session persistence, refresh logic, expiration handling, and logout functionality.',
        priority: 'Medium',
        estimate: 3
      },
      
      // PHASE III: Basic UI + Auth Integration
      {
        title: 'Create Dashboard Layouts for Each Role',
        description: 'Design and build role-specific dashboard layouts with responsive design and navigation menus.',
        priority: 'High',
        estimate: 4
      },
      {
        title: 'Build Navigation & Sidebar System',
        description: 'Create main navigation, sidebar component, menu items, mobile navigation, and breadcrumb system.',
        priority: 'Medium',
        estimate: 3
      },
      {
        title: 'Implement User Profile Management',
        description: 'Create profile page, profile editing, avatar upload, settings page, and password change.',
        priority: 'Medium',
        estimate: 4
      },
      {
        title: 'Create Company Settings Interface',
        description: 'Build company settings page, subscription management, company profile editing, and billing interface.',
        priority: 'Medium',
        estimate: 5
      },
      {
        title: 'Implement Basic CRUD Operations with Auth',
        description: 'Create API routes with auth, build CRUD components, implement data fetching, and error handling.',
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

createSprintIssues();

