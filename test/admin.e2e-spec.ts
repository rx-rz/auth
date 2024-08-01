import { HttpStatus, INestApplication } from '@nestjs/common';
import {
  createAuthenticatedAgent,
  createTestingApp,
  tearDownTestingApp,
} from './test.utils';
import TestAgent from 'supertest/lib/agent';
import { faker } from '@faker-js/faker';

describe('Admin E2E', () => {
  let app: INestApplication;
  let authAgent: TestAgent;
  beforeAll(async () => {
    app = await createTestingApp();
    authAgent = await createAuthenticatedAgent(app);
  });
  afterAll(async () => {
    await tearDownTestingApp(app, authAgent);
  });

  describe('admin - register', () => {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email();
    const password = faker.internet.password();
    it('registers an admin and returns a success status of true', async () => {
      const response = await authAgent.post('/admin/register').send({
        firstName,
        lastName,
        email,
        password,
      });
      expect(response.body.success).toBe(true);
    });

    it('throws a conflict exception and returns a success status of false if admin is already registered', async () => {
      const response = await authAgent.post('/admin/register').send({
        firstName,
        lastName,
        email,
        password,
      });
      expect(response.body.success).toBe(false);
      expect(response.statusCode).toBe(HttpStatus.CONFLICT);
    });
  });
});
