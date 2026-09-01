/**
 * Seeds the database with the admin account and sensible starter content.
 *
 * IMPORTANT — what this does and does not create:
 *  - Creates ONE admin login (email/password from env or CLI args below).
 *  - Creates default site settings, theme, navigation, availability, and
 *    Home/About page content using the same clearly-labeled placeholder
 *    copy that ships as in-app fallbacks (see src/lib/constants.ts).
 *  - Creates a handful of placeholder services so the booking flow and
 *    services page have something to show immediately.
 *  - Does NOT create fake testimonials, fake reviews, fake statistics, or
 *    any client galleries/appointments/messages — those are real business
 *    data and must come from actual use of the admin dashboard.
 *
 * Run with:  npm run seed
 * Re-running is safe — it upserts singletons and skips services/admin users
 * that already exist rather than duplicating them.
 */
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config(); // fall back to .env if present

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import AdminUserModel from "../src/models/AdminUser";
import SiteSettingsModel from "../src/models/SiteSettings";
import ThemeSettingsModel from "../src/models/ThemeSettings";
import NavigationItemModel from "../src/models/NavigationItem";
import PageContentModel from "../src/models/PageContent";
import ServiceModel from "../src/models/Service";
import AvailabilitySettingsModel from "../src/models/AvailabilitySettings";
import {
  DEFAULT_SITE_SETTINGS,
  DEFAULT_THEME,
  DEFAULT_NAVIGATION,
  DEFAULT_HOME_SECTIONS,
  DEFAULT_ABOUT_SECTIONS,
  DEFAULT_SERVICES,
  DEFAULT_AVAILABILITY,
} from "../src/lib/constants";

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is not set. Add it to .env.local before seeding.");
    process.exit(1);
  }

  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@countrytymefoto.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "ChangeMe123!";

  console.log("Connecting to MongoDB…");
  await mongoose.connect(uri);

  console.log("Seeding admin user…");
  const existingAdmin = await AdminUserModel.findOne({ email: adminEmail.toLowerCase() });
  if (existingAdmin) {
    console.log(`  Admin "${adminEmail}" already exists — skipping.`);
  } else {
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    await AdminUserModel.create({
      email: adminEmail.toLowerCase(),
      passwordHash,
      name: "Richard",
      role: "owner",
    });
    console.log(`  Created admin "${adminEmail}".`);
    console.log(`  ⚠ Password: "${adminPassword}" — sign in and change it immediately if this was auto-generated.`);
  }

  console.log("Seeding site settings…");
  await SiteSettingsModel.findOneAndUpdate({}, { $setOnInsert: DEFAULT_SITE_SETTINGS }, { upsert: true });

  console.log("Seeding theme settings…");
  await ThemeSettingsModel.findOneAndUpdate({}, { $setOnInsert: DEFAULT_THEME }, { upsert: true });

  console.log("Seeding availability settings…");
  await AvailabilitySettingsModel.findOneAndUpdate({}, { $setOnInsert: DEFAULT_AVAILABILITY }, { upsert: true });

  console.log("Seeding navigation…");
  const navCount = await NavigationItemModel.countDocuments();
  if (navCount === 0) {
    await NavigationItemModel.insertMany(DEFAULT_NAVIGATION);
  } else {
    console.log("  Navigation already has items — skipping.");
  }

  console.log("Seeding home & about page content…");
  await PageContentModel.findOneAndUpdate(
    { page: "home" },
    { $setOnInsert: { page: "home", sections: DEFAULT_HOME_SECTIONS } },
    { upsert: true }
  );
  await PageContentModel.findOneAndUpdate(
    { page: "about" },
    { $setOnInsert: { page: "about", sections: DEFAULT_ABOUT_SECTIONS } },
    { upsert: true }
  );

  console.log("Seeding placeholder services…");
  const serviceCount = await ServiceModel.countDocuments();
  if (serviceCount === 0) {
    await ServiceModel.insertMany(DEFAULT_SERVICES);
    console.log(`  Created ${DEFAULT_SERVICES.length} placeholder services.`);
  } else {
    console.log("  Services already exist — skipping.");
  }

  console.log("\nDone. Sign in at /admin/login and start replacing placeholder content.");
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
