/*
  Warnings:

  - You are about to drop the `Chat` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Message` DROP FOREIGN KEY `Message_chatId_fkey`;

-- DropIndex
DROP INDEX `Message_chatId_fkey` ON `Message`;

-- DropTable
DROP TABLE `Chat`;
