import { mockApiClient } from '../services/api/mockClient';

describe('Delivery Flow & Status Pipeline Transitions', () => {
  const courierId = 'courier-001';

  test('should list available jobs with ASSIGNED status', async () => {
    const jobs = await mockApiClient.getAvailableJobs();
    expect(jobs.length).toBeGreaterThan(0);
    jobs.forEach((job) => {
      expect(job.status).toBe('ASSIGNED');
    });
  });

  test('should execute step-by-step state transitions: ASSIGNED -> ACCEPTED -> PICKED_UP -> DELIVERING -> DELIVERED', async () => {
    const availableJobs = await mockApiClient.getAvailableJobs();
    const initialJob = availableJobs[0];

    // 1. ASSIGNED -> ACCEPTED
    const acceptedJob = await mockApiClient.acceptJob(initialJob.id, courierId);
    expect(acceptedJob.status).toBe('ACCEPTED');
    expect(acceptedJob.courierId).toBe(courierId);

    // 2. ACCEPTED -> PICKED_UP
    const pickedUpJob = await mockApiClient.updateJobStatus(initialJob.id, 'PICKED_UP');
    expect(pickedUpJob.status).toBe('PICKED_UP');
    expect(pickedUpJob.pickedUpAt).toBeDefined();

    // 3. PICKED_UP -> DELIVERING
    const deliveringJob = await mockApiClient.updateJobStatus(initialJob.id, 'DELIVERING');
    expect(deliveringJob.status).toBe('DELIVERING');

    // 4. DELIVERING -> DELIVERED
    const deliveredJob = await mockApiClient.updateJobStatus(initialJob.id, 'DELIVERED');
    expect(deliveredJob.status).toBe('DELIVERED');
    expect(deliveredJob.deliveredAt).toBeDefined();

    // No active job remains for courier
    const activeJob = await mockApiClient.getActiveJob(courierId);
    expect(activeJob).toBeNull();
  });

  test('should reject invalid or skipped status transitions', async () => {
    const availableJobs = await mockApiClient.getAvailableJobs();
    const newJob = availableJobs[0];

    // Accept job first (ASSIGNED -> ACCEPTED)
    await mockApiClient.acceptJob(newJob.id, courierId);

    // Attempt invalid skipped transition: ACCEPTED -> DELIVERED directly
    await expect(mockApiClient.updateJobStatus(newJob.id, 'DELIVERED')).rejects.toThrow(
      /Invalid status transition/
    );

    // Attempt invalid skipped transition: ACCEPTED -> DELIVERING directly
    await expect(mockApiClient.updateJobStatus(newJob.id, 'DELIVERING')).rejects.toThrow(
      /Invalid status transition/
    );
  });
});
