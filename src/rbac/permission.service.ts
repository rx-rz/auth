import { RoleBasedAccessControlRepository } from "./rbac.repository";

export class PermissionService {
  constructor(private readonly rbacRepository: RoleBasedAccessControlRepository){}

  async createPermission(name: string, description: string){
    const permission = await this.rbacRepository.createPermission({name, description})
    return {success: true, permission}
  } 

  async assignPermissionToRole(){}

  async getSpecificPermission(){}

  async updatePermission(){}

  async deletePermission(){}
  
}
