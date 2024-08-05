import { HttpStatus, INestApplication } from '@nestjs/common';
import {
  AdminPayload,
  createAuthenticatedAgent,
  createProjectAuthenticatedAgent,
  createTestingApp,
  tearDownTestingApp,
} from './test.utils';
import TestAgent from 'supertest/lib/agent';
import { faker } from '@faker-js/faker';
import { RegisterAdminDto } from 'src/admin/schema';

describe('Admin E2E', () => {
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

  describe('admin - register', () => {
    const [email, password] = [faker.internet.email(), faker.internet.password()];
    it('registers an admin and returns a success status of true', async () => {
      const response = await authAgent.post('/admin/register').send({
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email,
        password,
      });
      expect(response.body.success).toBe(true);
    });

    it('throws a conflict exception and returns a success status of false if admin is already registered', async () => {
      const response = await authAgent.post('/admin/register').send({
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email,
        password,
      });
      expect(response.body.success).toBe(false);
      expect(response.statusCode).toBe(HttpStatus.CONFLICT);
    });
  });

  // before each of the following tests, another test admin is created
  // to use for every other test that follows. this will allow for test
  // isolation
  let testAdmin: RegisterAdminDto;
  beforeEach(async () => {
    testAdmin = {
      email: faker.internet.email(),
      password: faker.internet.password(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
    };
    await authAgent.post('/admin/register').send(testAdmin);
  });

  afterEach(async () => {
    await authAgent.delete('/admin/delete').query({ email: testAdmin.email });
  });

  describe('admin - login', () => {
    it('logs in an admin successfully', async () => {
      const response = await authAgent.post('/admin/login').send({
        email: testAdmin.email,
        password: testAdmin.password,
      });
      expect(response.body.success).toBe(true);
      expect(response.body.accessToken).toBeDefined();
    });

    it('throws a not found exception for an inexistent email', async () => {
      const response = await authAgent.post('/admin/login').send({
        email: 'invalidemail@email.invalid.com',
        password: testAdmin.password,
      });
      expect(response.body.success).toBe(false);
      expect(response.statusCode).toBe(HttpStatus.NOT_FOUND);
    });

    it('throws a bad request exception for an invalid password', async () => {
      const response = await authAgent.post('/admin/login').send({
        email: testAdmin.email,
        password: 'AdaINVALIDPASSWORD@1!!',
      });
      expect(response.body.success).toBe(false);
      expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });
  });

  describe('admin - update details', () => {
    it('updates admin details successfully', async () => {
      const response = await authAgent.put('/admin/update-details').send({
        email: testAdmin.email,
        isVerified: true,
        mfaEnabled: true,
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
      });
      expect(response.body.success).toBe(true);
      expect(response.body.admin.isVerified).toBe(true);
      expect(response.body.admin.mfaEnabled).toBe(true);
    });

    it('throws a not found exception for non-existent admin', async () => {
      const response = await authAgent.put('/admin/update-details').send({
        email: 'nonexistentemail@example.com',
        firstName: faker.person.firstName(),
      });
      expect(response.body.success).toBe(false);
      expect(response.statusCode).toBe(HttpStatus.NOT_FOUND);
    });
  });

  describe('admin - update email', () => {
    it('updates admin email successfully', async () => {
      const response = await authAgent.put('/admin/update-email').send({
        currentEmail: testAdmin.email,
        newEmail: faker.internet.email(),
        password: testAdmin.password,
      });
      expect(response.body.success).toBe(true);
    });

    it('throws a conflict exception for existing new email', async () => {
      const response = await authAgent.put('/admin/update-email').send({
        currentEmail: testAdmin.email,
        newEmail: testAdmin.email, // Use an email that already exists
        password: testAdmin.password,
      });
      expect(response.body.success).toBe(false);
      expect(response.statusCode).toBe(HttpStatus.CONFLICT);
    });

    it('throws a not found exception for non-existent current email', async () => {
      const response = await authAgent.put('/admin/update-email').send({
        currentEmail: 'nonexistentemail@example.com',
        newEmail: faker.internet.email(),
        password: testAdmin.password,
      });
      expect(response.body.success).toBe(false);
      expect(response.statusCode).toBe(HttpStatus.NOT_FOUND);
    });

    it('throws a bad request exception for invalid password', async () => {
      const response = await authAgent.put('/admin/update-email').send({
        currentEmail: testAdmin.email,
        newEmail: faker.internet.email(),
        password: 'invalidPassword!A@',
      });
      expect(response.body.success).toBe(false);
      expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });
  });

  describe('admin - update password', () => {
    it('updates admin password successfully', async () => {
      const response = await authAgent.put('/admin/update-password').send({
        currentPassword: testAdmin.password,
        email: testAdmin.email,
        newPassword: faker.internet.password(),
      });
      expect(response.body.success).toBe(true);
    });

    it('throws a not found exception for non-existent email', async () => {
      const response = await authAgent.put('/admin/update-password').send({
        currentPassword: testAdmin.password,
        email: 'nonexistentemail@example.com',
        newPassword: faker.internet.password(),
      });
      expect(response.body.success).toBe(false);
      expect(response.statusCode).toBe(HttpStatus.NOT_FOUND);
    });

    it('throws a bad request exception for invalid current password', async () => {
      const response = await authAgent.put('/admin/update-password').send({
        currentPassword: 'invalidCurrentPassword',
        email: testAdmin.email,
        newPassword: faker.internet.password(),
      });
      expect(response.body.success).toBe(false);
      expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });
  });

  describe('admin - get projects', () => {
    it('retrieves admin projects successfully', async () => {
      const response = await authAgent.get(`/admin/get-projects`).query({
        email: testAdmin.email,
      });
      expect(response.body.success).toBe(true);
      expect(response.body.adminProjects).toBeDefined();
    });

    it('throws a not found exception for non-existent admin', async () => {
      const response = await authAgent.get(`/admin/get-projects`).query({
        email: 'nonexistentemail@gmail.com',
      });
      expect(response.body.success).toBe(false);
      expect(response.statusCode).toBe(HttpStatus.NOT_FOUND);
    });
  });

  describe('admin - get project by name', () => {
    it('retrieves admin project by name successfully', async () => {
      // create a test project in the db first before fetching it
      const { agent: projectAuthenticatedAgent } = await provideProjectCredentialsForAgent(
        authAgent,
        adminDetails.id,
      );
      const response = await projectAuthenticatedAgent.get(`/admin/get-project-by-name`).send({
        adminId: adminDetails.id,
        name: faker.company.name(),
      });
      expect(response.body.success).toBe(true);
      expect(response.body.adminProject).toBeDefined();
    });

    it('throws a not found exception for non-existent project', async () => {
      const {} = createProjectAuthenticatedAgent(app);
      const response = await projectAuthenticatedAgent.get(`/admin/get-project-by-name`).send({
        adminId: adminDetails.id,
        name: 'nonexistentProjectName',
      });

      expect(response.body.adminProject).toBeNull();
      // expect(response.statusCode).toBe(HttpStatus.NOT_FOUND);
    });
  });

  describe('admin - delete', () => {
    it('deletes an admin successfully', async () => {
      const response = await authAgent.delete(`/admin/delete`).query({
        email: testAdmin.email,
      });
      expect(response.body.success).toBe(true);
    });

    it('throws a not found exception for non-existent admin', async () => {
      const response = await authAgent.delete(`/admin/delete`).query({
        email: 'nonexistentemail@gmail.com',
      });
      expect(response.body.success).toBe(false);
      expect(response.statusCode).toBe(HttpStatus.NOT_FOUND);
    });
  });
});
