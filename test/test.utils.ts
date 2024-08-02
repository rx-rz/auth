import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import * as cookieParser from 'cookie-parser';
import * as request from 'supertest';
import { faker } from '@faker-js/faker';
import { CentralizedExceptionFilter } from '../src/utils/exceptions/centralized-exception-filter';
import helmet from 'helmet';
import TestAgent from 'supertest/lib/agent';
import { verify } from 'jsonwebtoken';

let app: INestApplication;

export async function createTestingApp(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();
  app = moduleFixture.createNestApplication();
  app.use(helmet());
  app.use(cookieParser());
  app.useGlobalFilters(new CentralizedExceptionFilter());
  await app.init();
  return app;
}

let projectId: string;
let adminId: string;

export async function createAuthenticatedAgent(app: INestApplication) {
  const agent = request.agent(app.getHttpServer());
  const { apiKey, authToken, clientKey, projectId } =
    await getProjectAuthenticationRequirements();
  agent.set('Authorization', `Bearer ${authToken}`);
  agent.set('x-api-key', apiKey);
  agent.set('x-client-key', clientKey);
  agent.set('x-project-id', projectId);
  return agent;
}

export async function tearDownTestingApp(
  app: INestApplication,
  agent: TestAgent,
) {
  /* deleting an admin also immediately deletes a project as the schema is set to cascade.
  */
  await deleteAdminAccount(agent);
  await app.close();
}

async function deleteAdminAccount(agent: TestAgent) {
  const response = await agent.delete('/admin/delete').query({
    adminId,
  });
  return response;
}

async function getProjectAuthenticationRequirements() {
  const [email, password] = [faker.internet.email(), 'adesare!@1'];
  const adminIsCreated = await createTestAdmin(app, email, password);
  if (!adminIsCreated) throw new Error('Error in creating admin');
  const authToken = await getAuthToken(app, email, password);
  const projectId = await createProject(authToken);
  const { clientKey, apiKey } = await getProjectCredentials(
    projectId,
    authToken,
  );
  return {
    clientKey,
    apiKey,
    authToken,
    projectId,
  };
}

async function getProjectCredentials(projectId: string, authToken: string) {
  const response = await request(app.getHttpServer())
    .get('/project/get-keys')
    .query({ projectId })
    .set({ authorization: `Bearer ${authToken}` });

  const { clientKey, apiKey } = response.body;
  return { clientKey, apiKey };
}

async function createProject(authToken: string) {
  adminId = decodeAuthToken(authToken).id;
  const response = await request(app.getHttpServer())
    .post('/project/create-project')
    .send({
      name: faker.company.name(),
      adminId,
    })
    .set({ authorization: `Bearer ${authToken}` });
  projectId = response.body.project.id;
  return response.body.project.id;
}

function decodeAuthToken(authToken: string) {
  const admin: any = verify(authToken, process.env.JWT_ACCESS_SECRET || '');
  return admin;
}

export async function getAuthToken(
  app: INestApplication,
  email: string,
  password: string,
) {
  const response = await request(app.getHttpServer())
    .post('/admin/login')
    .send({ email, password });

  return response.body.accessToken;
}

async function createTestAdmin(
  app: INestApplication,
  email: string,
  password: string,
) {
  const response = await request(app.getHttpServer())
    .post('/admin/register')
    .send({
      email,
      password,
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
    });
  if (response.ok) return true;
}

export const mockJwtService = {
  signAsync: jest.fn()
}

export const mockConfigService = {
  get: jest.fn()
}

export const mockAppEventEmitter  = {
  emit: jest.fn()
}