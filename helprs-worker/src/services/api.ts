// API service for mobile app
const API_BASE_URL = 'http://192.168.1.118:3000/api/v1'; // Your local network IP
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
  location_address: string | null;
  worker_count: number;
  required_workers: number;
  accepted_workers: number;
  customer: {
    first_name: string;
    last_name: string;
    phone: string;
    email: string;
  } | null;
  appointment_type: {
    name: string;
    description: string | null;
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

class ApiService {
  private async makeRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  // Get available jobs for the test company
  async getJobs(status: string = 'open'): Promise<JobsResponse> {
    return this.makeRequest<JobsResponse>(
      `/jobs?status=${status}&company_id=${TEST_COMPANY_ID}`
    );
  }

  // Accept a job
  async acceptJob(jobId: string, workerId: string): Promise<AcceptJobResponse> {
    return this.makeRequest<AcceptJobResponse>(
      `/jobs/${jobId}/accept`,
      {
        method: 'POST',
        body: JSON.stringify({ worker_id: workerId }),
      }
    );
  }

  // Get jobs with different statuses
  async getOpenJobs(): Promise<JobsResponse> {
    return this.getJobs('open');
  }

  async getScheduledJobs(): Promise<JobsResponse> {
    return this.getJobs('scheduled');
  }

  async getInProgressJobs(): Promise<JobsResponse> {
    return this.getJobs('in_progress');
  }
}

export const apiService = new ApiService();
