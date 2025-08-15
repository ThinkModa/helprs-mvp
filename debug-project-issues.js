// Debug Project Issues
const { LinearClient } = require('@linear/sdk');

const LINEAR_API_KEY = 'lin_api_A1OQDQdRzZC5IBjP71GSHBSlPY34zD2buaxBlhCi';
const TEAM_ID = '2acfa215-9425-4516-b025-3a846b11111c';
const PROJECT_ID = 'd086ebbe-ab52-47aa-8aaa-0751c4630a02';

const linear = new LinearClient({ apiKey: LINEAR_API_KEY });

async function debugProjectIssues() {
  try {
    console.log('🔗 Connecting to Linear...');
    
    // Get the specific project
    const project = await linear.project(PROJECT_ID);
    console.log(`\n🏗️ Project Details:`);
    console.log(`   Name: ${project.name}`);
    console.log(`   ID: ${project.id}`);
    console.log(`   Key: ${project.key}`);
    console.log(`   Team: ${project.team?.name}`);
    console.log(`   State: ${project.state}`);
    
    // Get the team
    const team = await linear.team(TEAM_ID);
    console.log(`\n👥 Team Details:`);
    console.log(`   Name: ${team.name}`);
    console.log(`   ID: ${team.id}`);
    console.log(`   Key: ${team.key}`);
    
    // Get all issues
    const issues = await linear.issues();
    console.log(`\n📋 Total Issues: ${issues.nodes.length}`);
    
    // Find issues that should be in our project
    const projectIssues = issues.nodes.filter(issue => {
      return issue.project?.id === PROJECT_ID;
    });
    
    console.log(`\n🎯 Issues in Project "${project.name}": ${projectIssues.length}`);
    
    if (projectIssues.length > 0) {
      projectIssues.forEach(issue => {
        console.log(`   - ${issue.title} (${issue.identifier})`);
      });
    } else {
      console.log('   No issues found in project');
    }
    
    // Check recent issues (last 10)
    console.log(`\n📋 Recent Issues (last 10):`);
    issues.nodes.slice(0, 10).forEach(issue => {
      console.log(`   - ${issue.title} (${issue.identifier})`);
      console.log(`     Project: ${issue.project?.name || 'None'}`);
      console.log(`     Team: ${issue.team?.name || 'None'}`);
    });
    
    // Try to create a test issue
    console.log(`\n🧪 Creating test issue...`);
    
    const states = await linear.workflowStates();
    const todoState = states.nodes.find(s => s.name === 'To Do' || s.name === 'Backlog');
    
    const testIssue = await linear.createIssue({
      teamId: TEAM_ID,
      projectId: PROJECT_ID,
      title: 'TEST: Database Schema Issue',
      description: 'This is a test issue to verify project association.',
      priority: 1,
      stateId: todoState.id
    });
    
    console.log(`✅ Test issue created: ${testIssue.title} (${testIssue.identifier})`);
    console.log(`   Project: ${testIssue.project?.name || 'None'}`);
    console.log(`   Team: ${testIssue.team?.name || 'None'}`);
    
  } catch (error) {
    console.error('❌ Error debugging project issues:', error.message);
  }
}

debugProjectIssues();

