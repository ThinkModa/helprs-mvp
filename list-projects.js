// List Linear Projects
const { LinearClient } = require('@linear/sdk');

const LINEAR_API_KEY = 'lin_api_A1OQDQdRzZC5IBjP71GSHBSlPY34zD2buaxBlhCi';
const TEAM_ID = 'HELP';

const linear = new LinearClient({ apiKey: LINEAR_API_KEY });

async function listProjects() {
  try {
    console.log('🔗 Connecting to Linear...');
    
    // Get team
    const team = await linear.team(TEAM_ID);
    console.log(`✅ Connected to team: ${team.name}`);
    
    // Get all projects in the team
    const projects = await linear.projects();
    
    console.log('\n📋 All projects:');
    console.log('================');
    
    projects.nodes.forEach(project => {
      console.log(`\n🏗️ Project: ${project.name}`);
      console.log(`   ID: ${project.id}`);
      console.log(`   Key: ${project.key}`);
      console.log(`   Team: ${project.team?.name || 'Unknown'}`);
      console.log(`   Description: ${project.description || 'No description'}`);
      console.log(`   State: ${project.state}`);
    });
    
    console.log(`\n📊 Total projects found: ${projects.nodes.length}`);
    
    // Filter for our team
    const teamProjects = projects.nodes.filter(p => p.team?.key === TEAM_ID);
    console.log(`\n🎯 Projects in team '${TEAM_ID}': ${teamProjects.length}`);
    
  } catch (error) {
    console.error('❌ Error listing projects:', error.message);
  }
}

listProjects();
