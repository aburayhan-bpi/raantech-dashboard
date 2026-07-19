import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";
import dns from "dns";

// Force Node.js to use Google & Cloudflare DNS to bypass local ISP SRV blocks
dns.setServers(['8.8.8.8', '1.1.1.1']);

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env", override: true });

async function seed() {
  const dbConnect = (await import("../src/lib/mongoose")).default;
  const User = (await import("../src/models/User")).default;

  await dbConnect();

  const email = "raantechbd@gmail.com";
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    console.log("Super admin already exists!");
    process.exit(0);
  }

  const hashedPassword = await bcrypt.hash("admin123", 10);

  await User.create({
    name: "Raantech Super Admin",
    email,
    password: hashedPassword,
    role: "SUPER_ADMIN",
    status: "ACTIVE",
  });

  console.log("Super Admin created successfully!");
  console.log("Email: raantechbd@gmail.com");
  console.log("Password: admin123");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
