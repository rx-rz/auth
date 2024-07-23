import { RoleBasedAccessControlRepository } from './rbac.repository';

export class RoleService {
  constructor(
    private readonly rbacReository: RoleBasedAccessControlRepository,
  ) {}

  async createRole(name: String) {}
}
