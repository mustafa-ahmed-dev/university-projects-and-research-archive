/*
  Warnings:

  - A unique constraint covering the columns `[name,college_id]` on the table `departments` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "departments_name_college_id_key" ON "departments"("name", "college_id");
