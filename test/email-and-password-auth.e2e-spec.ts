import { INestApplication } from '@nestjs/common';
import TestAgent from 'supertest/lib/agent';
import {
  AdminPayload,
  createAuthenticatedAgent,
  createProjectAuthenticatedAgent,
  createTestingApp,
} from './test.utils';
import * as request from 'supertest';
import { faker } from '@faker-js/faker';
import { RegisterWithEmailAndPasswordDto } from 'src/auth/email-and-password-auth/dtos/register-with-email-and-password-dto';
describe('Email and Password Auth E2E', () => {
  let app: INestApplication;
  let agent: TestAgent;
  let adminDetails: AdminPayload;

  beforeAll(async () => {
    app = await createTestingApp();

    const { agent: projectAgent, details } = await createProjectAuthenticatedAgent(app);
    agent = projectAgent;
    adminDetails = details;
  });

  afterAll(async () => {
    app.close();
  });

  describe('register with email and password', () => {
    const dto: RegisterWithEmailAndPasswordDto = {
      email: faker.internet.email(),
      password: faker.internet.password(),
      projectId: faker.string.uuid(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
    };

    it('should successfully register a person with email and password', async () => {
      const response = await agent.post('/user/register').send(dto);
      console.log(response.body);
    });
  });
});
