const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';
const supabase = createClient(supabaseUrl, supabaseKey);

async function updateJobCustomers() {
  try {
    console.log('Updating job customer associations...');
    
    // Update job-2 to associate with Jane Smith
    const { data: job2Update, error: job2Error } = await supabase
      .from('jobs')
      .update({ customer_id: 'customer-2' })
      .eq('id', 'job-2');
    
    if (job2Error) {
      console.error('Error updating job-2:', job2Error);
    } else {
      console.log('✅ Updated job-2 with customer-2 (Jane Smith)');
    }
    
    // Update job_65618452 to associate with John Doe
    const { data: job1Update, error: job1Error } = await supabase
      .from('jobs')
      .update({ customer_id: 'customer-1' })
      .eq('id', 'job_65618452');
    
    if (job1Error) {
      console.error('Error updating job_65618452:', job1Error);
    } else {
      console.log('✅ Updated job_65618452 with customer-1 (John Doe)');
    }
    
    console.log('Job customer associations updated successfully!');
    
  } catch (error) {
    console.error('Error updating jobs:', error);
  }
}

updateJobCustomers();
