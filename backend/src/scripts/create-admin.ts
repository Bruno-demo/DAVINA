/**
 * Script to create an admin account in the system.
 *
 * Usage (run from backend directory):
 *   npx ts-node src/scripts/create-admin.ts
 *
 * Or inside Docker:
 *   docker exec -it backend npx ts-node src/scripts/create-admin.ts
 */
import dotenv from "dotenv";
dotenv.config();

import bcrypt from "bcryptjs";
import sequelize from "../config/db";
import User from "../models/user";
import { Roles } from "../enums/role.enum";

const ADMIN_NAME = "Bruno Admin";
const ADMIN_EMAIL = "auperbruno@gmail.com";
const ADMIN_PASSWORD = "Admin@2025!";

async function createAdmin(): Promise<void> {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connection established.");

    // Sync to ensure the table exists
    await User.sync();

    // Check if admin already exists
    const existingAdmin = await User.findOne({
      where: { u_email: ADMIN_EMAIL },
    });

    if (existingAdmin) {
      console.log(`⚠️  Admin account already exists: ${ADMIN_EMAIL}`);
      console.log(`   Role: ${existingAdmin.u_role}`);

      // If user exists but is not admin, upgrade them
      if (existingAdmin.u_role !== Roles.ADMIN) {
        await User.update(
          { u_role: Roles.ADMIN },
          { where: { u_email: ADMIN_EMAIL } }
        );
        console.log(`🔄 Upgraded existing user to admin role.`);
      }
    } else {
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

      await User.create({
        u_name: ADMIN_NAME,
        u_email: ADMIN_EMAIL,
        u_password: hashedPassword,
        u_role: Roles.ADMIN,
        is_verified: true,
      });

      console.log("🎉 Admin account created successfully!");
    }

    console.log("\n📋 Admin Credentials:");
    console.log(`   Email:    ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    console.log(`   Role:     admin`);
  } catch (error) {
    console.error("❌ Failed to create admin account:", error);
    process.exit(1);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

createAdmin();
