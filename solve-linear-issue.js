// Solve Linear API Project Association Issue
const { LinearClient } = require('@linear/sdk');

const LINEAR_API_KEY = 'lin_api_A1OQDQdRzZC5IBjP71GSHBSlPY34zD2buaxBlhCi';
const TEAM_ID = '2acfa215-9425-4516-b025-3a846b11111c';
const PROJECT_ID = 'd086ebbe-ab52-47aa-8aaa-0751c4630a02';

const linear = new LinearClient({ apiKey: LINEAR_API_KEY });

async function solveLinearIssue() {
  try {
    console.log('🔍 DIAGNOSING LINEAR API ISSUE...\n');
    
    // Step 1: Check API permissions
    console.log('1️⃣ Checking API permissions...');
    try {
      const me = await linear.viewer();
      console.log(`✅ API Key valid - Logged in as: ${me.name}`);
      console.log(`   Email: ${me.email}`);
      console.log(`   Role: ${me.role}`);
    } catch (error) {
      console.log(`❌ API Key issue: ${error.message}`);
      return;
    }
    
    // Step 2: Verify team access
    console.log('\n2️⃣ Verifying team access...');
    try {
      const team = await linear.team(TEAM_ID);
      console.log(`✅ Team access confirmed: ${team.name}`);
      console.log(`   Team ID: ${team.id}`);
      console.log(`   Team Key: ${team.key}`);
    } catch (error) {
      console.log(`❌ Team access issue: ${error.message}`);
      return;
    }
    
    // Step 3: Verify project access
    console.log('\n3️⃣ Verifying project access...');
    try {
      const project = await linear.project(PROJECT_ID);
      console.log(`✅ Project access confirmed: ${project.name}`);
      console.log(`   Project ID: ${project.id}`);
      console.log(`   Project State: ${project.state}`);
      console.log(`   Project Team: ${project.team?.name || 'None'}`);
    } catch (error) {
      console.log(`❌ Project access issue: ${error.message}`);
      return;
    }
    
    // Step 4: Check workflow states
    console.log('\n4️⃣ Checking workflow states...');
    try {
      const states = await linear.workflowStates();
      console.log(`✅ Found ${states.nodes.length} workflow states:`);
      states.nodes.forEach(state => {
        console.log(`   - ${state.name} (ID: ${state.id})`);
      });
    } catch (error) {
      console.log(`❌ Workflow states issue: ${error.message}`);
      return;
    }
    
    // Step 5: Test issue creation with minimal data
    console.log('\n5️⃣ Testing minimal issue creation...');
    try {
      const states = await linear.workflowStates();
      const todoState = states.nodes.find(s => s.name === 'To Do' || s.name === 'Backlog');
      
      const testIssue = await linear.createIssue({
        teamId: TEAM_ID,
        title: 'API Test Issue',
        description: 'Testing Linear API issue creation',
        stateId: todoState.id
      });
      
      console.log(`✅ Test issue created successfully!`);
      console.log(`   Issue ID: ${testIssue.id}`);
      console.log(`   Title: ${testIssue.title}`);
      console.log(`   Identifier: ${testIssue.identifier}`);
      console.log(`   Project: ${testIssue.project?.name || 'None'}`);
      console.log(`   Team: ${testIssue.team?.name || 'None'}`);
      
      // Step 6: Try to update the test issue with project
      console.log('\n6️⃣ Testing project association...');
      try {
        const updatedIssue = await linear.updateIssue(testIssue.id, {
          projectId: PROJECT_ID
        });
        console.log(`✅ Project association successful!`);
        console.log(`   Updated Project: ${updatedIssue.project?.name || 'None'}`);
      } catch (updateError) {
        console.log(`❌ Project association failed: ${updateError.message}`);
        
        // Step 7: Try alternative approach - create with project ID
        console.log('\n7️⃣ Trying alternative creation method...');
        try {
          const altIssue = await linear.createIssue({
            teamId: TEAM_ID,
            projectId: PROJECT_ID,
            title: 'Alternative Test Issue',
            description: 'Testing alternative creation method',
            stateId: todoState.id
          });
          
          console.log(`✅ Alternative method successful!`);
          console.log(`   Issue ID: ${altIssue.id}`);
          console.log(`   Title: ${altIssue.title}`);
          console.log(`   Project: ${altIssue.project?.name || 'None'}`);
          
        } catch (altError) {
          console.log(`❌ Alternative method failed: ${altError.message}`);
        }
      }
      
    } catch (error) {
      console.log(`❌ Issue creation failed: ${error.message}`);
    }
    
    // Step 8: Check if there are any existing issues in the project
    console.log('\n8️⃣ Checking existing project issues...');
    try {
      const issues = await linear.issues();
      const projectIssues = issues.nodes.filter(issue => 
        issue.project?.id === PROJECT_ID
      );
      
      console.log(`📊 Found ${projectIssues.length} issues in project:`);
      projectIssues.forEach(issue => {
        console.log(`   - ${issue.title} (${issue.identifier})`);
      });
      
    } catch (error) {
      console.log(`❌ Error checking existing issues: ${error.message}`);
    }
    
    console.log('\n🎯 DIAGNOSIS COMPLETE');
    console.log('=====================');
    console.log('If you see successful test issue creation above, the API is working.');
    console.log('If project association is failing, we may need to:');
    console.log('1. Check project permissions');
    console.log('2. Verify project is active');
    console.log('3. Try creating issues through the web interface first');
    
  } catch (error) {
    console.error('❌ Critical error:', error.message);
  }
}

solveLinearIssue();

