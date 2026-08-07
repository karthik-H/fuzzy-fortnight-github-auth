import { PrismaClient, Role, TaskStatus } from '@prisma/client';
import bcrypt from 'bcrypt';
import { DEFAULT_USER_ADMIN_PREFERENCES, DEFAULT_USER_DEVELOPER_PREFERENCES } from '../common/constants/appConstants';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Password123!', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@example.com',
      password: passwordHash,
      role: Role.ADMIN,
      preferences: DEFAULT_USER_ADMIN_PREFERENCES,
      workspaceMemberId: 1001,
      auth0_user_id: '',
    },
  });

  const developer = await prisma.user.upsert({
    where: { email: 'dev@example.com' },
    update: {},
    create: {
      name: 'Dev User',
      email: 'dev@example.com',
      password: passwordHash,
      role: Role.DEVELOPER,
      preferences: DEFAULT_USER_DEVELOPER_PREFERENCES,
      workspaceMemberId: 1002,
      auth0_user_id: '',
    },
  });

  const existingTasks = await prisma.task.count({
    where: { userId: { in: [admin.id, developer.id] } },
  });

  if (existingTasks === 0) {
    await prisma.task.createMany({
      data: [
        {
          title: 'Review auth pipeline',
          description: 'Verify login, logout, and session refresh cookies.',
          status: TaskStatus.TODO,
          userId: admin.id,
        },
        {
          title: 'Configure GitHub OAuth',
          description: 'Set client ID/secret and redirect URI for local testing.',
          status: TaskStatus.IN_PROGRESS,
          userId: admin.id,
        },
        {
          title: 'Smoke-test GitHub SSO gate',
          description: 'Confirm non-workspace emails are rejected with 403.',
          status: TaskStatus.TODO,
          userId: developer.id,
        },
        {
          title: 'Read-only task board check',
          description: 'Confirm tasks render on the home page after login.',
          status: TaskStatus.DONE,
          userId: developer.id,
        },
      ],
    });
  }

  console.log('Seeded users:', { admin: admin.email, developer: developer.email });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
