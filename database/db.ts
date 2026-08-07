// Database setup
import { PrismaClient } from '@prisma/client';
import { Role as RoleType, TaskStatus as TaskStatusType } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

export type DbRole = RoleType;
export type DbTaskStatus = TaskStatusType;

export default prisma;
