export type RegisterAdminResponse = {
  success: boolean;
  message: string;
}

export type LoginAdminResponse = {
  success: boolean;
  message: string;
  accessToken: string;
};

export type LogoutAdminResponse = RegisterAdminResponse;

export type UpdateAdminResponse = RegisterAdminResponse

export type UpdateAdminEmailResponse =RegisterAdminResponse

export type UpdateAdminPasswordResponse = RegisterAdminResponse

export type ResetAdminPasswordResponse = RegisterAdminResponse

export type GetAdminProjectsResponse = {
  success: boolean;
  adminProjects: {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    name: string;
  }[];
};


export type GetAdminProjectByNameResponse = {

}

export type DeleteAdminResponse = {
  success: boolean;
  admin: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    isVerified: boolean;
    mfaEnabled: boolean;
  };
};