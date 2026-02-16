-- AlterTable
ALTER TABLE "User" ADD COLUMN     "topicClusters" JSONB NOT NULL DEFAULT '{}';
