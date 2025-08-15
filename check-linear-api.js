// Check Linear API Methods
const { LinearClient } = require('@linear/sdk');

const LINEAR_API_KEY = 'lin_api_A1OQDQdRzZC5IBjP71GSHBSlPY34zD2buaxBlhCi';
const TEAM_ID = '2acfa215-9425-4516-b025-3a846b11111c';
const PROJECT_ID = 'd086ebbe-ab52-47aa-8aaa-0751c4630a02';

const linear = new LinearClient({ apiKey: LINEAR_API_KEY });

async function checkLinearAPI() {
  try {
    console.log('🔍 CHECKING LINEAR API METHODS...\n');
    
    // Check what methods are available
    console.log('📋 Available Linear client methods:');
    console.log(Object.getOwnPropertyNames(Object.getPrototypeOf(linear)).filter(name => 
      !name.startsWith('_') && typeof linear[name] === 'function'
    ));
    
    console.log('\n🔍 Testing basic API calls...');
    
    // Test 1: Get teams
    console.log('\n1️⃣ Testing teams()...');
    try {
      const teams = await linear.teams();
      console.log(`✅ Teams API works - Found ${teams.nodes.length} teams`);
      teams.nodes.forEach(team => {
        console.log(`   - ${team.name} (${team.key})`);
      });
    } catch (error) {
      console.log(`❌ Teams API failed: ${error.message}`);
    }
    
    // Test 2: Get projects
    console.log('\n2️⃣ Testing projects()...');
    try {
      const projects = await linear.projects();
      console.log(`✅ Projects API works - Found ${projects.nodes.length} projects`);
      projects.nodes.forEach(project => {
        console.log(`   - ${project.name} (${project.id})`);
      });
    } catch (error) {
      console.log(`❌ Projects API failed: ${error.message}`);
    }
    
    // Test 3: Get issues
    console.log('\n3️⃣ Testing issues()...');
    try {
      const issues = await linear.issues();
      console.log(`✅ Issues API works - Found ${issues.nodes.length} issues`);
    } catch (error) {
      console.log(`❌ Issues API failed: ${error.message}`);
    }
    
    // Test 4: Get workflow states
    console.log('\n4️⃣ Testing workflowStates()...');
    try {
      const states = await linear.workflowStates();
      console.log(`✅ Workflow states API works - Found ${states.nodes.length} states`);
      states.nodes.forEach(state => {
        console.log(`   - ${state.name}`);
      });
    } catch (error) {
      console.log(`❌ Workflow states API failed: ${error.message}`);
    }
    
    // Test 5: Try to create a simple issue
    console.log('\n5️⃣ Testing createIssue()...');
    try {
      const states = await linear.workflowStates();
      const todoState = states.nodes.find(s => s.name === 'To Do' || s.name === 'Backlog');
      
      if (todoState) {
        const testIssue = await linear.createIssue({
          teamId: TEAM_ID,
          title: 'API Test Issue',
          description: 'Testing Linear API',
          stateId: todoState.id
        });
        
        console.log(`✅ Issue creation works!`);
        console.log(`   Issue ID: ${testIssue.id}`);
        console.log(`   Title: ${testIssue.title}`);
        console.log(`   Identifier: ${testIssue.identifier}`);
        
        // Test 6: Try to update the issue
        console.log('\n6️⃣ Testing updateIssue()...');
        try {
          const updatedIssue = await linear.updateIssue(testIssue.id, {
            description: 'Updated description'
          });
          console.log(`✅ Issue update works!`);
        } catch (updateError) {
          console.log(`❌ Issue update failed: ${updateError.message}`);
        }
        
      } else {
        console.log(`❌ No todo state found`);
      }
    } catch (error) {
      console.log(`❌ Issue creation failed: ${error.message}`);
    }
    
    console.log('\n🎯 API CHECK COMPLETE');
    console.log('===================');
    
  } catch (error) {
    console.error('❌ Critical error:', error.message);
  }
}

checkLinearAPI();

