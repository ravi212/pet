/*
  Warnings:

  - The `role` column on the `ProjectCollaborator` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterEnum
-- This migration adds two new variants to the "CollaboratorRole" enum.
-- With --incremental flag, migrations for existing rows are included.
ALTER TYPE "CollaboratorRole" ADD VALUE 'commenter' BEFORE 'viewer';
