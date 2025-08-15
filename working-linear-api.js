// Working Linear API Solution
const LINEAR_API_KEY = 'lin_api_A1OQDQdRzZC5IBjP71GSHBSlPY34zD2buaxBlhCi';
const TEAM_ID = '2acfa215-9425-4516-b025-3a846b11111c';
const PROJECT_ID = 'd086ebbe-ab52-47aa-8aaa-0751c4630a02';

async function workingLinearAPI() {
  try {
    console.log('🚀 WORKING LINEAR API SOLUTION...\n');
    
    const headers = {
      'Authorization': LINEAR_API_KEY,
      'Content-Type': 'application/json'
    };
    
    // Get workflow states first
    console.log('1️⃣ Getting workflow states...');
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
    
    console.log(`✅ Found todo state: ${todoState.name} (${todoState.id})`);
    
    // Database issues to create
    const databaseIssues = [
      {
        title: 'Design Multi-Tenant Database Architecture',
        description: 'Design the core database architecture for multi-tenant SaaS platform with company isolation, RLS policies, and scalable design for future features.',
        priority: 'High',
        estimate: 8
      },
      {
        title: 'Create Database Migration Files',
        description: 'Create proper migration files for Supabase deployment including all table definitions, indexes, and RLS policies.',
        priority: 'High',
        estimate: 4
      },
      {
        title: 'Implement Row Level Security (RLS) Policies',
        description: 'Implement comprehensive RLS policies for multi-tenant isolation with company-based data separation and role-based access control.',
        priority: 'High',
        estimate: 6
      },
      {
        title: 'Create Database Test Suite',
        description: 'Create comprehensive test suite for database operations including company isolation, user authentication, worker management, and payment workflows.',
        priority: 'High',
        estimate: 4
      },
      {
        title: 'Create Database Documentation',
        description: 'Create comprehensive database documentation including ERD, API specifications, business rules, and schema reference.',
        priority: 'Medium',
        estimate: 3
      },
      {
        title: 'Set Up Local Development Environment',
        description: 'Configure local development environment with Docker including Supabase CLI setup, custom ports, and remote project linking.',
        priority: 'High',
        estimate: 2
      },
      {
        title: 'Implement Database Indexes for Performance',
        description: 'Create database indexes for optimal query performance including company-based queries, user authentication, and job scheduling.',
        priority: 'Medium',
        estimate: 2
      }
    ];
    
    console.log('\n2️⃣ Creating database issues...');
    const createdIssues = [];
    
    for (const issueData of databaseIssues) {
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
                    project {
                      id
                      name
                    }
                    team {
                      id
                      name
                    }
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
          console.log(`✅ Created: ${issue.title} (${issue.identifier})`);
          console.log(`   Project: ${issue.project?.name || 'None'}`);
        } else {
          console.log(`❌ Failed to create: ${issueData.title}`);
          console.log('   Error:', JSON.stringify(createData, null, 2));
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.log(`❌ Error creating ${issueData.title}: ${error.message}`);
      }
    }
    
    console.log('\n🎉 ISSUE CREATION COMPLETE!');
    console.log('===========================');
    console.log(`📊 Total issues created: ${createdIssues.length}`);
    
    // Show summary
    console.log('\n📋 Created Issues:');
    console.log('==================');
    createdIssues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue.title} (${issue.identifier})`);
      console.log(`   Project: ${issue.project?.name || 'None'}`);
    });
    
    // Verify issues are in project
    console.log('\n3️⃣ Verifying project issues...');
    const verifyResponse = await fetch('https://api.linear.app/graphql', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        query: `
          query {
            project(id: "${PROJECT_ID}") {
              id
              name
              issues {
                nodes {
                  id
                  title
                  identifier
                }
              }
            }
          }
        `
      })
    });
    
    const verifyData = await verifyResponse.json();
    if (verifyData.data?.project?.issues?.nodes) {
      const projectIssues = verifyData.data.project.issues.nodes;
      console.log(`✅ Found ${projectIssues.length} issues in project:`);
      projectIssues.forEach(issue => {
        console.log(`   - ${issue.title} (${issue.identifier})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Critical error:', error.message);
  }
}

workingLinearAPI();

