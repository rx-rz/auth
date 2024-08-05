import { INestApplication } from '@nestjs/common';
import TestAgent from 'supertest/lib/agent';
import {
  AdminPayload,
  createAuthenticatedAgent,
  createTestingApp,
  tearDownTestingApp,
} from './test.utils';

describe('User E2E', () => {
  let app: INestApplication;
  let authAgent: TestAgent;
  let adminDetails: AdminPayload;

  beforeAll(async () => {
    app = await createTestingApp();
    const { agent, details } = await createAuthenticatedAgent(app);
    authAgent = agent;
    adminDetails = details;
  });

  afterAll(async () => {
    await tearDownTestingApp(app, authAgent, adminDetails.email);
  });
});
