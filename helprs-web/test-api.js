import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000/api/v1';

async function testJobAPI() {
  console.log('🧪 Testing Helprs Job API...\n');

  try {
    // Test 1: Get available jobs
    console.log('1️⃣ Testing GET /jobs...');
    const jobsResponse = await fetch(`${BASE_URL}/jobs?status=open&company_id=test-company-1`);
    
    if (jobsResponse.ok) {
      const jobsData = await jobsResponse.json();
      console.log('✅ GET /jobs successful');
      console.log(`   Found ${jobsData.count} jobs`);
      if (jobsData.jobs.length > 0) {
        console.log(`   First job: ${jobsData.jobs[0].title}`);
      }
    } else {
      console.log('❌ GET /jobs failed:', jobsResponse.status);
      const error = await jobsResponse.text();
      console.log('   Error:', error);
    }

    console.log('\n2️⃣ Testing POST /jobs/{id}/accept...');
    
    // First, get a job to accept
    const getJobsResponse = await fetch(`${BASE_URL}/jobs?status=open&company_id=test-company-1`);
    if (getJobsResponse.ok) {
      const jobsData = await getJobsResponse.json();
      
      if (jobsData.jobs.length > 0) {
        const jobId = jobsData.jobs[0].id;
        const acceptResponse = await fetch(`${BASE_URL}/jobs/${jobId}/accept`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
                      body: JSON.stringify({
              worker_id: 'worker-2'
            })
        });

        if (acceptResponse.ok) {
          const acceptData = await acceptResponse.json();
          console.log('✅ POST /jobs/{id}/accept successful');
          console.log(`   Job status: ${acceptData.job_status}`);
          console.log(`   Accepted workers: ${acceptData.accepted_workers}/${acceptData.required_workers}`);
        } else {
          console.log('❌ POST /jobs/{id}/accept failed:', acceptResponse.status);
          const error = await acceptResponse.text();
          console.log('   Error:', error);
        }
      } else {
        console.log('⚠️  No jobs available to test accept endpoint');
      }
    }

    console.log('\n3️⃣ Testing error handling...');
    
    // Test missing company_id
    const errorResponse = await fetch(`${BASE_URL}/jobs?status=open`);
    if (!errorResponse.ok) {
      console.log('✅ Error handling working (missing company_id)');
    } else {
      console.log('❌ Error handling failed - should require company_id');
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }

  console.log('\n🎉 API testing complete!');
}

// Run the tests
testJobAPI();
