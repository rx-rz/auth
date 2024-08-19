import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMagicLinkDto, TokenDto } from './schema';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Mailer } from 'src/infra/mail/mail.service';
import { ProjectRepository } from 'src/project/project.repository';
import { UserRepository } from 'src/user/user.repository';

@Injectable()
export class MagicLinkAuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly projectRepository: ProjectRepository,
    private readonly userRepository: UserRepository,
    private readonly mailer: Mailer,
  ) {}

  async checkIfProjectExists(projectId: string) {
    const project = await this.projectRepository.getProject(projectId);
    if (!project) throw new NotFoundException('Project does not exist.');
    return project;
  }

  async getUserByEmail(email: string) {
    const user = await this.userRepository.getUserByEmail(email);
    return user;
  }

  async createMagicLink({ projectId, referralLink, userEmail }: CreateMagicLinkDto) {
    const project = await this.checkIfProjectExists(projectId);
    const payload = { userEmail, projectId };

    const token = await this.jwtService.signAsync(payload, {
      expiresIn: '10m',
      secret: this.configService.get('JWT_ACCESS_SECRET'),
    });

    const link = `${referralLink}/verify?token=${token}`;

    const { error, response } = await this.mailer.sendEmail({
      recipients: [userEmail],
      subject: 'Auth Magic Link',
      from: 'adeleyetemiloluwa.work@gmail.com',
      html: `
        <p>Click the link below to login:</p>
        <a href="${link}">${link}</a>
      `,
    });
    if (error) throw error;
    return { success: true, link };
  }

  async verifyMagicLink({ token }: TokenDto) {
    const decodedToken = await this.jwtService.verifyAsync(token, {
      secret: this.configService.get('JWT_ACCESS_SECRET'),
    });
    return { success: true, decodedToken };
  }
}
