import { HttpStatus, INestApplication } from '@nestjs/common';
import {
  AdminPayload,
  createAuthenticatedAgent,
  createProjectAuthenticatedAgent,
  createTestingApp,
  deleteProject,
  tearDownTestingApp,
} from './test.utils';
import TestAgent from 'supertest/lib/agent';
import { faker } from '@faker-js/faker';
import {
  CreateProjectDto,
  UpdateProjectNameDto,
  VerifyProjectApiKeysDto,
} from 'src/project/schema';

describe('Project E2E', () => {
  let app: INestApplication;
  let authAgent: TestAgent;
  let adminDetails: AdminPayload;

  beforeAll(async () => {
    app = await createTestingApp();
    const { agent: projectAgent, details } = await createProjectAuthenticatedAgent(app);
    authAgent = projectAgent;
    adminDetails = details;
  });

  afterAll(async () => {
    await tearDownTestingApp(app, authAgent, adminDetails.email);
  });

  describe('project - create', () => {
    const createProjectDto: CreateProjectDto = {
      name: faker.company.name(),
      adminId: adminDetails.id,
    };
    it('creates a project and returns a success status of true', async () => {
      const response = await authAgent.post('/project/create-project').send(createProjectDto);
      expect(response.body.success).toBe(true);
      expect(response.body.project.name).toBe(createProjectDto.name);
    });

    it('throws a conflict exception and returns a success status of false if the same admin has already created a project with the same name', async () => {
      const response = await authAgent.post('/project/create-project').send(createProjectDto);
      expect(response.body.success).toBe(false);
      expect(response.statusCode).toBe(HttpStatus.CONFLICT);
    });
  });

  let projectAuthenticatedAgent: TestAgent;
  let projectId: string;
  let projectName: string;

  beforeEach(async () => {
    const { agent, projectId: id, projectName: name } = await createProjectAuthenticatedAgent(app);
    projectAuthenticatedAgent = agent;
    projectId = id;
    projectName = name;
  });

  afterEach(async () => {
    await deleteProject(authAgent, projectId);
  });

  describe('project - update name', () => {
    it('updates project name successfully', async () => {
      const updatedProjectName = faker.commerce.productName();
      const response = await projectAuthenticatedAgent.put('/project/update-project-name').send({
        projectId,
        name: updatedProjectName,
      });
      console.log(response.body);
      expect(response.body.success).toBe(true);
      expect(response.body.project.name).toBe(updatedProjectName);
    });

    it('throws a not found exception for non-existent project', async () => {
      const response = await projectAuthenticatedAgent.put('/project/update-project-name').send({
        projectId: 'nonexistentProjectId',
        name: faker.commerce.productName(),
      });
      console.log(response.body);
      expect(response.body.success).toBe(false);
      expect(response.statusCode).toBe(HttpStatus.NOT_FOUND);
    });
  });

  describe('project - get keys', () => {
    it('retrieves project keys successfully', async () => {
      const response = await projectAuthenticatedAgent.get('/project/get-keys').query({
        projectId,
      });
      console.log(response.body);
      expect(response.body.success).toBe(true);
      expect(response.body.clientKey).toBeDefined();
      expect(response.body.apiKey).toBeDefined();
    });

    it('throws a not found exception for non-existent project', async () => {
      const response = await projectAuthenticatedAgent.get('/project/get-keys').query({
        projectId: 'nonexistentProjectId',
      });
      console.log(response.body);
      expect(response.body.success).toBe(false);
      expect(response.statusCode).toBe(HttpStatus.NOT_FOUND);
    });
  });

  describe('project - get project', () => {
    it('retrieves project details successfully', async () => {
      const response = await projectAuthenticatedAgent.get('/project/get-project').query({
        projectId,
      });
      console.log(response.body);
      expect(response.body.success).toBe(true);
      expect(response.body.project.name).toBe(projectName);
    });

    it('throws a not found exception for non-existent project', async () => {
      const response = await projectAuthenticatedAgent.get('/project/get-project').query({
        projectId: 'nonexistentProjectId',
      });
      console.log(response.body);
      expect(response.body.success).toBe(false);
      expect(response.statusCode).toBe(HttpStatus.NOT_FOUND);
    });
  });

  describe('project - get magic links', () => {
    it('retrieves project magic links successfully', async () => {
      const response = await projectAuthenticatedAgent.get('/project/get-magic-links').query({
        projectId,
      });
      console.log(response.body);
      expect(response.body.success).toBe(true);
      expect(response.body.project.magicLinks).toBeDefined();
    });

    it('throws a not found exception for non-existent project', async () => {
      const response = await projectAuthenticatedAgent.get('/project/get-magic-links').query({
        projectId: 'nonexistentProjectId',
      });
      console.log(response.body);
      expect(response.body.success).toBe(false);
      expect(response.statusCode).toBe(HttpStatus.NOT_FOUND);
    });
  });

  describe('project - get refresh tokens', () => {
    it('retrieves project refresh tokens successfully', async () => {
      const response = await projectAuthenticatedAgent.get('/project/get-refresh-tokens').query({
        projectId,
      });
      console.log(response.body);
      expect(response.body.success).toBe(true);
      expect(response.body.project.refreshTokens).toBeDefined();
    });

    it('throws a not found exception for non-existent project', async () => {
      const response = await authAgent.get('/project/get-refresh-tokens').query({
        projectId: 'nonexistentProjectId',
      });
      console.log(response.body);
      expect(response.body.success).toBe(false);
      expect(response.statusCode).toBe(HttpStatus.NOT_FOUND);
    });
  });

  describe('project - get all by admin', () => {
    it('retrieves all projects created by admin successfully', async () => {
      const response = await authAgent.get('/project/get-all-by-admin').query({
        adminId: adminDetails.id,
      });
      console.log(response.body);
      expect(response.body.success).toBe(true);
      expect(response.body.project).toBeDefined();
    });

    it('throws a not found exception for non-existent admin', async () => {
      const response = await authAgent.get('/project/get-all-by-admin').query({
        adminId: 'nonexistentAdminId',
      });
      console.log(response.body);
      expect(response.body.success).toBe(false);
      expect(response.statusCode).toBe(HttpStatus.NOT_FOUND);
    });
  });

  describe('project - delete', () => {
    it('deletes a project successfully', async () => {
      const response = await authAgent.delete('/project/delete').query({ projectId });
      console.log(response.body);
      expect(response.body.success).toBe(true);
    });

    it('throws a not found exception for non-existent project', async () => {
      const response = await authAgent.delete('/project/delete').query({
        projectId: 'nonexistentProjectId',
      });
      console.log(response.body);
      expect(response.body.success).toBe(false);
      expect(response.statusCode).toBe(HttpStatus.NOT_FOUND);
    });
  });

  describe('project - verify api keys', () => {
    it('verifies project api keys successfully', async () => {
      const { apiKey, clientKey } = await authAgent
        .get('/project/get-keys')
        .query({
          projectId,
        })
        .then((res) => res.body);
      const response = await authAgent.post('/project/verify-api-keys').send({
        apiKey,
        clientKey,
      });
      console.log(response.body);
      expect(response.body.success).toBe(true);
    });

    it('throws a not found exception for non-existent project', async () => {
      const response = await authAgent.post('/project/verify-api-keys').send({
        apiKey: 'nonexistentApiKey',
        clientKey: 'nonexistentClientKey',
      });
      console.log(response.body);
      expect(response.body.success).toBe(false);
      expect(response.statusCode).toBe(HttpStatus.NOT_FOUND);
    });

    it('throws a bad request exception for invalid api key', async () => {
      const { clientKey } = await authAgent
        .get('/project/get-keys')
        .query({
          projectId,
        })
        .then((res) => res.body);
      const response = await authAgent.post('/project/verify-api-keys').send({
        apiKey: 'invalidApiKey',
        clientKey,
      });
      console.log(response.body);
      expect(response.body.success).toBe(false);
      expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });
  });
});
