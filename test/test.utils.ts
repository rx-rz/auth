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
import { LoginAdminDto, RegisterAdminDto } from 'src/admin/schema';
import { CreateProjectDto } from 'src/project/schema';

let app: INestApplication;

export type AdminPayload = {
  email: string;
  firstName: string;
  isVerified: boolean;
  lastName: string;
  id: string;
  role: 'rollo-admin';
  mfaEnabled: boolean;
};
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

export async function tearDownTestingApp(
  app: INestApplication,
  agent: TestAgent,
  adminEmail: string,
) {
  /* deleting an admin also immediately deletes any associated project as the schema is set to cascade.
   */
  await deleteAdminAccount(agent, adminEmail);
  await app.close();
}

export async function createAuthenticatedAgent(app: INestApplication) {
  const agent = request.agent(app.getHttpServer());
  const [email, password] = [faker.internet.email(), faker.internet.password()];
  await createAdmin(agent, email, password);
  const { token, details } = await getAdminDetails(agent, email, password);
  // token derived upon log in is set in the agent.
  agent.set('Authorization', `Bearer ${token}`);
  return { agent, details };
}

export async function createProjectAuthenticatedAgent(app: INestApplication) {
  const agent = request.agent(app.getHttpServer());
  const [email, password] = [faker.internet.email(), faker.internet.password()];
  await createAdmin(agent, email, password);
  const { token, details } = await getAdminDetails(agent, email, password);
  agent.set('Authorization', `Bearer ${token}`);
  const projectName = faker.company.name();
  const { projectId } = await createProject(agent, projectName, details.id);
  const { clientKey, apiKey } = await getProjectKeys(agent, projectId);
  agent.set('x-project-id', projectId);
  agent.set('x-api-key', apiKey);
  agent.set('x-client-key', clientKey);
  return { agent, projectId, projectName, clientKey, apiKey, details };
}

export async function createAdmin(agent: TestAgent, email: string, password: string) {
  // register test admin of whose details will be used for logging in to get a token
  const registerAdminDto: RegisterAdminDto = {
    email,
    password,
    lastName: faker.person.lastName(),
    firstName: faker.person.firstName(),
  };
  const response = await agent.post('/admin/register').send(registerAdminDto);
  if (response.body.success === false) {
    throw new Error(response.body.message);
  }
}

export async function getAdminDetails(agent: TestAgent, email: string, password: string) {
  const loginAdminDto: LoginAdminDto = {
    email,
    password,
  };
  const response = await agent.post('/admin/login').send(loginAdminDto);
  // log in an admin and get an access token. the access token is decoded to get
  // other details that might be used for other tests
  const details = decodeAdminAuthToken(response.body.accessToken);
  return { details, token: response.body.accessToken };
}

async function deleteAdminAccount(agent: TestAgent, email: string) {
  const response = await agent.delete('/admin/delete').query({
    email,
  });
  return response;
}

function decodeAdminAuthToken(authToken: string) {
  const admin = verify(authToken, process.env.JWT_ACCESS_SECRET || '');
  return admin as AdminPayload;
}

export async function createProject(agent: TestAgent, name: string, adminId: string) {
  const createProjectDto: CreateProjectDto = {
    name,
    adminId,
  };
  const { body } = await agent.post('/project/create-project').send(createProjectDto);
  if (body.success === false) {
    console.log(body);
    throw new Error(body.message ?? 'An error occured');
  }
  return { projectId: body.project.id };
}

export async function deleteProject(agent: TestAgent, projectId: string) {
  await agent.delete('/project/delete-project').query({ projectId });
}

export async function getProjectKeys(agent: TestAgent, projectId: string) {
  const { body } = await agent.get('/project/get-keys').query({ projectId });
  if (body.success === false) {
    console.log(body);
    throw new Error(body.message ?? 'An error occured');
  }
  return { clientKey: body.clientKey, apiKey: body.apiKey };
}
