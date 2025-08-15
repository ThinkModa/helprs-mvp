// Update Database Progress Directly by Issue ID
const { LinearClient } = require('@linear/sdk');

const LINEAR_API_KEY = 'lin_api_A1OQDQdRzZC5IBjP71GSHBSlPY34zD2buaxBlhCi';

const linear = new LinearClient({ apiKey: LINEAR_API_KEY });

// Database issues with their IDs from the list
const databaseIssues = {
  '4ec02ccc-8337-4b7d-bf3d-ba358e447e73': { // Database Schema Design - HELP-5
    title: 'Database Schema Design',
    status: 'done',
    completionNotes: `✅ COMPLETED: 
    - Complete database schema designed with multi-tenant architecture
    - All MVP tables created: companies, users, workers, customers, calendars, jobs, payments, ratings, forms
    - Future scalability planned for AI integration, analytics, customer app
    - Schema supports unlimited workers/customers per business account
    - Proper relationships and constraints defined
    - Migration file created: 20250814175323_initial_schema.sql`
  },
  'c0b878c5-ee91-45b2-9bed-6e03b57e254e': { // Database Migrations - HELP-6
    title: 'Database Migrations',
    status: 'done',
    completionNotes: `✅ COMPLETED:
    - Migration file created and applied to Supabase
    - Local Docker environment configured with separate container
    - Remote Supabase project linked and synchronized
    - Schema deployed to both local and remote environments
    - All tables, indexes, and RLS policies applied successfully`
  },
  'bc00c474-c5b7-4fac-9b66-93b5d81afe2f': { // RLS Policies Setup - HELP-7
    title: 'RLS Policies Setup',
    status: 'done',
    completionNotes: `✅ COMPLETED:
    - Comprehensive RLS policies implemented for multi-tenant isolation
    - Company-based data separation enforced
    - Role-based access control (Super Admin, Org Admin, Worker)
    - Proper user authentication checks in all policies
    - Security policies tested and verified`
  },
  '24ddd92d-40eb-44a4-8ca1-733847af7ba7': { // Database Testing - HELP-8
    title: 'Database Testing',
    status: 'done',
    completionNotes: `✅ COMPLETED:
    - Comprehensive test suite created and executed
    - Company creation and isolation verified
    - User authentication and roles tested
    - Worker management workflows tested
    - Job scheduling and assignment tested
    - Payment workflows tested
    - Rating system tested
    - Multi-tenant data separation confirmed
    - All CRUD operations working correctly`
  },
  '36ea1c49-3d4a-466a-a84b-b2e0de34da5b': { // Database Documentation - HELP-9
    title: 'Database Documentation',
    status: 'in_progress',
    completionNotes: `🔄 IN PROGRESS:
    - Need to create comprehensive data model documentation
    - Need to create ERD (Entity Relationship Diagram)
    - Need to document business rules and workflows
    - Need to create API endpoint specifications
    - Currently at 0% completion`
  }
};

async function updateDatabaseProgressDirect() {
  try {
    console.log('🔗 Connecting to Linear...');
    
    // Get workflow states
    const states = await linear.workflowStates();
    const todoState = states.nodes.find(s => s.name === 'To Do' || s.name === 'Backlog');
    const inProgressState = states.nodes.find(s => s.name === 'In Progress');
    const doneState = states.nodes.find(s => s.name === 'Done');
    
    console.log('📋 Updating database work progress...');
    
    // Update each database issue directly by ID
    for (const [issueId, progress] of Object.entries(databaseIssues)) {
      console.log(`\n🔄 Updating: ${progress.title}`);
      
      // Determine target state
      let targetStateId;
      if (progress.status === 'done') {
        targetStateId = doneState.id;
      } else if (progress.status === 'in_progress') {
        targetStateId = inProgressState.id;
      } else {
        targetStateId = todoState.id;
      }
      
      // Update issue status
      await linear.updateIssue(issueId, {
        stateId: targetStateId
      });
      
      // Add completion comment
      await linear.createComment({
        issueId: issueId,
        body: progress.completionNotes
      });
      
      console.log(`✅ Updated: ${progress.title} → ${progress.status.toUpperCase()}`);
    }
    
    console.log('\n🎉 Database progress update complete!');
    
    // Show summary
    console.log('\n📊 Database Work Summary:');
    console.log('========================');
    Object.entries(databaseIssues).forEach(([id, progress]) => {
      const status = progress.status === 'done' ? '✅ DONE' : 
                    progress.status === 'in_progress' ? '🔄 IN PROGRESS' : '⏳ TODO';
      console.log(`${status} - ${progress.title}`);
    });
    
  } catch (error) {
    console.error('❌ Error updating progress:', error.message);
  }
}

updateDatabaseProgressDirect();

