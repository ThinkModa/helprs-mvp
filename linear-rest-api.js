// Linear REST API Direct Access
const LINEAR_API_KEY = 'lin_api_A1OQDQdRzZC5IBjP71GSHBSlPY34zD2buaxBlhCi';
const TEAM_ID = '2acfa215-9425-4516-b025-3a846b11111c';
const PROJECT_ID = 'd086ebbe-ab52-47aa-8aaa-0751c4630a02';

async function linearRestAPI() {
  try {
    console.log('🔍 TESTING LINEAR REST API DIRECTLY...\n');
    
    const headers = {
      'Authorization': LINEAR_API_KEY,
      'Content-Type': 'application/json'
    };
    
    // Test 1: Get viewer info
    console.log('1️⃣ Testing viewer endpoint...');
    try {
      const viewerResponse = await fetch('https://api.linear.app/graphql', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          query: `
            query {
              viewer {
                id
                name
                email
              }
            }
          `
        })
      });
      
      const viewerData = await viewerResponse.json();
      console.log('✅ Viewer API response:', JSON.stringify(viewerData, null, 2));
    } catch (error) {
      console.log(`❌ Viewer API failed: ${error.message}`);
    }
    
    // Test 2: Get team info
    console.log('\n2️⃣ Testing team endpoint...');
    try {
      const teamResponse = await fetch('https://api.linear.app/graphql', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          query: `
            query {
              team(id: "${TEAM_ID}") {
                id
                name
                key
                description
              }
            }
          `
        })
      });
      
      const teamData = await teamResponse.json();
      console.log('✅ Team API response:', JSON.stringify(teamData, null, 2));
    } catch (error) {
      console.log(`❌ Team API failed: ${error.message}`);
    }
    
    // Test 3: Get project info
    console.log('\n3️⃣ Testing project endpoint...');
    try {
      const projectResponse = await fetch('https://api.linear.app/graphql', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          query: `
            query {
              project(id: "${PROJECT_ID}") {
                id
                name
                key
                state
                team {
                  id
                  name
                }
              }
            }
          `
        })
      });
      
      const projectData = await projectResponse.json();
      console.log('✅ Project API response:', JSON.stringify(projectData, null, 2));
    } catch (error) {
      console.log(`❌ Project API failed: ${error.message}`);
    }
    
    // Test 4: Get workflow states
    console.log('\n4️⃣ Testing workflow states...');
    try {
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
      console.log('✅ Workflow states response:', JSON.stringify(statesData, null, 2));
    } catch (error) {
      console.log(`❌ Workflow states failed: ${error.message}`);
    }
    
    // Test 5: Create an issue
    console.log('\n5️⃣ Testing issue creation...');
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
                  title: "REST API Test Issue"
                  description: "Testing Linear REST API directly"
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
                errors {
                  message
                }
              }
            }
          `
        })
      });
      
      const createData = await createResponse.json();
      console.log('✅ Issue creation response:', JSON.stringify(createData, null, 2));
      
      // If successful, try to update with project
      if (createData.data?.issueCreate?.success && createData.data?.issueCreate?.issue?.id) {
        const issueId = createData.data.issueCreate.issue.id;
        
        console.log('\n6️⃣ Testing project association...');
        try {
          const updateResponse = await fetch('https://api.linear.app/graphql', {
            method: 'POST',
            headers,
            body: JSON.stringify({
              query: `
                mutation {
                  issueUpdate(
                    id: "${issueId}"
                    input: {
                      projectId: "${PROJECT_ID}"
                    }
                  ) {
                    success
                    issue {
                      id
                      title
                      project {
                        id
                        name
                      }
                    }
                    errors {
                      message
                    }
                  }
                }
              `
            })
          });
          
          const updateData = await updateResponse.json();
          console.log('✅ Issue update response:', JSON.stringify(updateData, null, 2));
        } catch (updateError) {
          console.log(`❌ Issue update failed: ${updateError.message}`);
        }
      }
      
    } catch (error) {
      console.log(`❌ Issue creation failed: ${error.message}`);
    }
    
    console.log('\n🎯 REST API TEST COMPLETE');
    console.log('========================');
    
  } catch (error) {
    console.error('❌ Critical error:', error.message);
  }
}

linearRestAPI();
