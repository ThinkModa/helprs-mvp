// Update Linear Progress - Check and Update Issue Status
const LINEAR_API_KEY = 'lin_api_A1OQDQdRzZC5IBjP71GSHBSlPY34zD2buaxBlhCi';
const TEAM_ID = '2acfa215-9425-4516-b025-3a846b11111c';
const PROJECT_ID = 'd086ebbe-ab52-47aa-8aaa-0751c4630a02';

async function updateLinearProgress() {
  try {
    console.log('📊 CHECKING LINEAR PROGRESS...\n');
    
    const headers = {
      'Authorization': LINEAR_API_KEY,
      'Content-Type': 'application/json'
    };
    
    // Get all issues in the project
    const issuesResponse = await fetch('https://api.linear.app/graphql', {
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
                  state {
                    name
                    type
                  }
                  priority
                  estimate
                  description
                }
              }
            }
          }
        `
      })
    });
    
    const issuesData = await issuesResponse.json();
    const issues = issuesData.data?.project?.issues?.nodes || [];
    
    console.log(`📋 Found ${issues.length} issues in project`);
    
    // Group issues by status
    const issuesByStatus = {
      'Todo': [],
      'In Progress': [],
      'Done': [],
      'Backlog': []
    };
    
    issues.forEach(issue => {
      const status = issue.state?.name || 'Unknown';
      if (issuesByStatus[status]) {
        issuesByStatus[status].push(issue);
      } else {
        issuesByStatus[status] = [issue];
      }
    });
    
    // Display current status
    console.log('\n📊 CURRENT STATUS:');
    console.log('==================');
    Object.entries(issuesByStatus).forEach(([status, statusIssues]) => {
      console.log(`\n${status} (${statusIssues.length}):`);
      statusIssues.forEach(issue => {
        console.log(`  - ${issue.title} (${issue.identifier})`);
      });
    });
    
    // Identify database-related issues that should be marked as Done
    const databaseIssues = [
      'Design Multi-Tenant Database Architecture',
      'Create Database Migration Files',
      'Implement Row Level Security (RLS) Policies',
      'Create Database Test Suite',
      'Set Up Local Development Environment'
    ];
    
    console.log('\n🎯 DATABASE ISSUES TO MARK AS DONE:');
    console.log('===================================');
    
    const issuesToUpdate = [];
    issues.forEach(issue => {
      if (databaseIssues.includes(issue.title) && issue.state?.name !== 'Done') {
        issuesToUpdate.push(issue);
        console.log(`  - ${issue.title} (${issue.identifier}) - Current: ${issue.state?.name}`);
      }
    });
    
    if (issuesToUpdate.length > 0) {
      console.log(`\n🔄 Updating ${issuesToUpdate.length} issues to Done...`);
      
      // Get Done state ID
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
      const doneState = statesData.data.workflowStates.nodes.find(s => s.name === 'Done');
      
      if (doneState) {
        for (const issue of issuesToUpdate) {
          try {
            const updateResponse = await fetch('https://api.linear.app/graphql', {
              method: 'POST',
              headers,
              body: JSON.stringify({
                query: `
                  mutation {
                    issueUpdate(
                      id: "${issue.id}"
                      input: {
                        stateId: "${doneState.id}"
                      }
                    ) {
                      success
                      issue {
                        id
                        title
                        state {
                          name
                        }
                      }
                    }
                  }
                `
              })
            });
            
            const updateData = await updateResponse.json();
            if (updateData.data?.issueUpdate?.success) {
              console.log(`✅ Updated: ${issue.title} to Done`);
            } else {
              console.log(`❌ Failed to update: ${issue.title}`);
            }
            
            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 300));
            
          } catch (error) {
            console.log(`❌ Error updating ${issue.title}: ${error.message}`);
          }
        }
      }
    } else {
      console.log('✅ All database issues are already marked as Done!');
    }
    
    console.log('\n🎉 PROGRESS UPDATE COMPLETE!');
    
  } catch (error) {
    console.error('❌ Error updating progress:', error.message);
  }
}

updateLinearProgress();

