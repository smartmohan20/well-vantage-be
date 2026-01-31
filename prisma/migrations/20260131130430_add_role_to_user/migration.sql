-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'GYM_OWNER', 'GYM_EMPLOYEE', 'MEMBER');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'USER';
