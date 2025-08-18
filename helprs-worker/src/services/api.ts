// API service for mobile app
// Try multiple connection methods for development
const getApiBaseUrl = () => {
  // For development, prioritize network IP for mobile devices
  if (__DEV__) {
    return 'http://192.168.1.118:3000/api/v1';
  }
  return 'http://192.168.1.118:3000/api/v1';
};

const API_BASE_URL = getApiBaseUrl();
const TEST_COMPANY_ID = 'test-company-1';

export interface Job {
  id: string;
  title: string;
  description: string | null;
  status: string;
  scheduled_date: string;
  scheduled_time: string;
  estimated_duration: number | null;
  base_price: number;
  minimum_price: number | null;
  calculated_pay: number;
  location_address: string | null;
  assigned_worker_id: string | null;
  assignment_date: string | null;
  assignment_type: string | null;
  customer: {
    first_name: string;
    last_name: string;
    phone: string;
    email: string;
  } | null;
  appointment_type: {
    name: string;
    description: string | null;
    base_duration: number;
  } | null;
  assigned_worker: {
    id: string;
    hourly_rate: number;
  } | null;
  form: {
    name: string;
  } | null;
  created_at: string;
  updated_at: string;
}

export interface JobsResponse {
  jobs: Job[];
  count: number;
}

export interface AcceptJobResponse {
  success: boolean;
  job_status: string;
  accepted_workers: number;
  required_workers: number;
  message: string;
}

export interface FormResponse {
  form_name: string;
  answers: string[];
}

export interface FormResponsesResponse {
  form_responses: FormResponse[];
  count: number;
}

class ApiService {
  private async makeRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
    // Try multiple URLs for development
    const urls = [
      'http://192.168.1.118:3000/api/v1',
      'http://localhost:3000/api/v1',
      'http://10.0.2.2:3000/api/v1', // Android emulator
    ];

    for (const baseUrl of urls) {
      try {
        console.log(`Trying API URL: ${baseUrl}${endpoint}`);
        const response = await fetch(`${baseUrl}${endpoint}`, {
          headers: {
            'Content-Type': 'application/json',
          },
          ...options,
        });

        if (!response.ok) {
          throw new Error(`API request failed: ${response.status}`);
        }

        const result = await response.json();
        console.log(`API request successful: ${baseUrl}${endpoint}`);
        return result;
      } catch (error) {
        console.error(`Failed to connect to ${baseUrl}${endpoint}:`, error);
        // Continue to next URL
      }
    }

    // If all URLs fail, throw the last error
    throw new Error('All API endpoints failed. Please check your network connection and ensure the web server is running.');
  }

  // Get available jobs for the test company
  async getJobs(status: string = 'open'): Promise<JobsResponse> {
    return this.makeRequest<JobsResponse>(
      `/jobs?status=${status}&company_id=${TEST_COMPANY_ID}`
    );
  }

  // Get jobs by type (available, my_jobs, all_jobs)
  async getJobsByType(type: 'available' | 'my_jobs' | 'all_jobs', workerId?: string): Promise<JobsResponse> {
    let endpoint = `/jobs?type=${type}&company_id=${TEST_COMPANY_ID}`;
    if (type === 'my_jobs' && workerId) {
      endpoint += `&worker_id=${workerId}`;
    }
    return this.makeRequest<JobsResponse>(endpoint);
  }

  // Get worker's next upcoming job
  async getNextJob(workerId: string): Promise<{ next_job: Job | null }> {
    return this.makeRequest<{ next_job: Job | null }>(
      `/workers/${workerId}/next-job?company_id=${TEST_COMPANY_ID}`
    );
  }

  // Accept a job
  async acceptJob(jobId: string, workerId: string): Promise<AcceptJobResponse> {
    return this.makeRequest<AcceptJobResponse>(
      `/jobs/${jobId}/accept`,
      {
        method: 'POST',
        body: JSON.stringify({ worker_id: workerId })
      }
    );
  }

  // Get form responses for a specific job
  async getFormResponses(jobId: string): Promise<FormResponsesResponse> {
    return this.makeRequest<FormResponsesResponse>(
      `/jobs/${jobId}/form-responses`
    );
  }

  // Clock in to a job
  async clockIn(jobId: string, workerId: string): Promise<any> {
    return this.makeRequest<any>(
      `/jobs/${jobId}/clock-in`,
      {
        method: 'POST',
        body: JSON.stringify({ worker_id: workerId })
      }
    );
  }

  // Clock out from a job
  async clockOut(jobId: string, workerId: string): Promise<any> {
    return this.makeRequest<any>(
      `/jobs/${jobId}/clock-out`,
      {
        method: 'POST',
        body: JSON.stringify({ worker_id: workerId })
      }
    );
  }

  // Get jobs with different statuses
  async getOpenJobs(): Promise<JobsResponse> {
    return this.getJobsByType('available');
  }

  async getScheduledJobs(): Promise<JobsResponse> {
    return this.getJobs('scheduled');
  }

  async getInProgressJobs(): Promise<JobsResponse> {
    return this.getJobs('in_progress');
  }

  // Get available jobs (open jobs that can be accepted)
  async getAvailableJobs(): Promise<JobsResponse> {
    return this.getJobsByType('available');
  }

  // Get worker's assigned jobs
  async getMyJobs(workerId: string): Promise<JobsResponse> {
    return this.getJobsByType('my_jobs', workerId);
  }

  // Get all jobs
  async getAllJobs(): Promise<JobsResponse> {
    return this.getJobsByType('all_jobs');
  }
}

export const apiService = new ApiService();
