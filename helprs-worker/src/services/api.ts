// API service for mobile app - Direct Supabase integration
import { supabase } from '../lib/supabase';

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
  // Enhanced logging function
  private logError(method: string, error: any, additionalInfo?: any) {
    console.error(`🚨 API Error in ${method}:`, {
      error: error,
      message: error?.message,
      code: error?.code,
      details: error?.details,
      additionalInfo: additionalInfo,
      timestamp: new Date().toISOString(),
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
    });
  }

  // Get available jobs for the test company
  async getJobs(status: string = 'open'): Promise<JobsResponse> {
    try {
      console.log('🔍 getJobs called with status:', status);
      console.log('🔍 Using company_id:', TEST_COMPANY_ID);
      
      const { data, error, count } = await supabase
        .from('jobs')
        .select(`
          *,
          customer:customers(first_name, last_name, phone, email),
          appointment_type:appointment_types(name, description, base_duration),
          assigned_worker:workers(id, hourly_rate),
          form:forms(name)
        `)
        .eq('company_id', TEST_COMPANY_ID)
        .eq('status', status);

      console.log('📊 getJobs result:', {
        dataLength: data?.length || 0,
        count: count,
        error: error,
        hasData: !!data
      });

      if (error) {
        this.logError('getJobs', error, { status, companyId: TEST_COMPANY_ID });
        throw error;
      }

      return {
        jobs: data || [],
        count: count || 0
      };
    } catch (error) {
      this.logError('getJobs', error, { status, companyId: TEST_COMPANY_ID });
      throw error;
    }
  }

  // Get jobs by type (available, my_jobs, all_jobs)
  async getJobsByType(type: 'available' | 'my_jobs' | 'all_jobs', workerId?: string): Promise<JobsResponse> {
    try {
      console.log('🔍 getJobsByType called with:', { type, workerId });
      
      let query = supabase
        .from('jobs')
        .select(`
          *,
          customer:customers(first_name, last_name, phone, email),
          appointment_type:appointment_types(name, description, base_duration),
          assigned_worker:workers(id, hourly_rate),
          form:forms(name)
        `)
        .eq('company_id', TEST_COMPANY_ID);

      switch (type) {
        case 'available':
          query = query.eq('status', 'open');
          break;
        case 'my_jobs':
          if (workerId) {
            query = query.eq('assigned_worker_id', workerId);
          }
          break;
        case 'all_jobs':
          // No additional filters needed
          break;
      }

      const { data, error, count } = await query;

      console.log('📊 getJobsByType result:', {
        type,
        dataLength: data?.length || 0,
        count: count,
        error: error
      });

      if (error) {
        this.logError('getJobsByType', error, { type, workerId });
        throw error;
      }

      return {
        jobs: data || [],
        count: count || 0
      };
    } catch (error) {
      this.logError('getJobsByType', error, { type, workerId });
      throw error;
    }
  }

  // Get worker's next upcoming job
  async getNextJob(workerId: string): Promise<{ next_job: Job | null }> {
    try {
      console.log('🔍 getNextJob called with workerId:', workerId);
      console.log('🔍 Current date:', new Date().toISOString().split('T')[0]);
      
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          customer:customers(first_name, last_name, phone, email),
          appointment_type:appointment_types(name, description, base_duration),
          assigned_worker:workers(id, hourly_rate),
          form:forms(name)
        `)
        .eq('company_id', TEST_COMPANY_ID)
        .eq('assigned_worker_id', workerId)
        .in('status', ['scheduled', 'in_progress'])
        .gte('scheduled_date', new Date().toISOString().split('T')[0])
        .order('scheduled_date', { ascending: true })
        .order('scheduled_time', { ascending: true })
        .limit(1)
        .single();

      console.log('📊 getNextJob result:', {
        hasData: !!data,
        data: data,
        error: error,
        errorCode: error?.code
      });

      // Handle PGRST116 (no rows found) as a normal case, not an error
      if (error && error.code === 'PGRST116') {
        console.log('ℹ️ No next job found for worker - this is normal');
        return {
          next_job: null
        };
      }

      // Handle other errors
      if (error) {
        this.logError('getNextJob', error, { workerId });
        throw error;
      }

      return {
        next_job: data || null
      };
    } catch (error: any) {
      // Only log and throw if it's not a PGRST116 error
      if (error?.code !== 'PGRST116') {
        this.logError('getNextJob', error, { workerId });
        throw error;
      }
      
      // For PGRST116, return null job (normal case)
      console.log('ℹ️ No next job found for worker - returning null');
      return {
        next_job: null
      };
    }
  }

  // Get available jobs (alias for getJobsByType with 'available')
  async getAvailableJobs(): Promise<JobsResponse> {
    console.log('🔍 getAvailableJobs called');
    return this.getJobsByType('available');
  }

  // Get my jobs (alias for getJobsByType with 'my_jobs')
  async getMyJobs(workerId: string): Promise<JobsResponse> {
    console.log('🔍 getMyJobs called with workerId:', workerId);
    return this.getJobsByType('my_jobs', workerId);
  }

  // Get all jobs (alias for getJobsByType with 'all_jobs')
  async getAllJobs(): Promise<JobsResponse> {
    console.log('🔍 getAllJobs called');
    return this.getJobsByType('all_jobs');
  }

  // Accept a job
  async acceptJob(jobId: string, workerId: string): Promise<AcceptJobResponse> {
    try {
      // First, get the current job to check if it can be accepted
      const { data: job, error: jobError } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      if (jobError) throw jobError;
      if (!job) throw new Error('Job not found');

      if (job.status !== 'open') {
        return {
          success: false,
          job_status: job.status,
          accepted_workers: 0,
          required_workers: 1,
          message: 'Job is not available for acceptance'
        };
      }

      // Update the job to assign it to the worker
      const { data, error } = await supabase
        .from('jobs')
        .update({
          assigned_worker_id: workerId,
          status: 'scheduled',
          assignment_date: new Date().toISOString(),
          assignment_type: 'manual'
        })
        .eq('id', jobId)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        job_status: 'scheduled',
        accepted_workers: 1,
        required_workers: 1,
        message: 'Job accepted successfully'
      };
    } catch (error) {
      console.error('Error accepting job:', error);
      throw error;
    }
  }

  // Get form responses for a specific job
  async getFormResponses(jobId: string): Promise<FormResponsesResponse> {
    try {
      const { data, error, count } = await supabase
        .from('form_responses')
        .select('*')
        .eq('job_id', jobId);

      if (error) throw error;

      // Transform the data to match the expected format
      const formResponses = (data || []).map(response => ({
        form_name: response.form_name || 'Unknown Form',
        answers: response.answers || []
      }));

      return {
        form_responses: formResponses,
        count: count || 0
      };
    } catch (error) {
      console.error('Error fetching form responses:', error);
      throw error;
    }
  }

  // Clock in to a job
  async clockIn(jobId: string, workerId: string): Promise<any> {
    try {
      // Create a time entry for clock in
      const { data, error } = await supabase
        .from('time_entries')
        .insert({
          job_id: jobId,
          worker_id: workerId,
          clock_in_time: new Date().toISOString(),
          entry_type: 'clock_in'
        })
        .select()
        .single();

      if (error) throw error;

      // Update job status to in_progress
      await supabase
        .from('jobs')
        .update({ status: 'in_progress' })
        .eq('id', jobId);

      return {
        success: true,
        message: 'Clocked in successfully',
        time_entry: data
      };
    } catch (error) {
      console.error('Error clocking in:', error);
      throw error;
    }
  }

  // Clock out from a job
  async clockOut(jobId: string, workerId: string): Promise<any> {
    try {
      // Find the most recent clock in entry for this job/worker
      const { data: clockInEntry, error: findError } = await supabase
        .from('time_entries')
        .select('*')
        .eq('job_id', jobId)
        .eq('worker_id', workerId)
        .eq('entry_type', 'clock_in')
        .is('clock_out_time', null)
        .order('clock_in_time', { ascending: false })
        .limit(1)
        .single();

      if (findError) throw findError;

      // Update the time entry with clock out time
      const { data, error } = await supabase
        .from('time_entries')
        .update({
          clock_out_time: new Date().toISOString()
        })
        .eq('id', clockInEntry.id)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        message: 'Clocked out successfully',
        time_entry: data
      };
    } catch (error) {
      console.error('Error clocking out:', error);
      throw error;
    }
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
}

export const apiService = new ApiService();
