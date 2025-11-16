/**
 * Demo Data Seeding Script
 * Creates demo accounts and sample properties
 */

import { createConnection } from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const connection = await createConnection({
  host: process.env.DATABASE_URL?.split("@")[1]?.split("/")[0] || "localhost",
  user: process.env.DATABASE_URL?.split("://")[1]?.split(":")[0] || "root",
  password: process.env.DATABASE_URL?.split(":")[2]?.split("@")[0] || "",
  database: process.env.DATABASE_URL?.split("/").pop() || "test",
});

console.log("🌱 Starting demo data seeding...");

try {
  // Create demo admin user
  const demoAdminId = await connection.execute(
    `INSERT INTO users (openId, name, email, phone, whatsapp, role, subscriptionStatus, isPremium, createdAt, updatedAt, lastSignedIn) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), NOW())`,
    ["demo-admin-001", "Demo Admin", "admin@demo.com", "+6281234567890", "+6281234567890", "admin", "active", true]
  );

  console.log("✅ Created demo admin user");

  // Create demo seller user
  const demoSellerId = await connection.execute(
    `INSERT INTO users (openId, name, email, phone, whatsapp, role, subscriptionStatus, isPremium, createdAt, updatedAt, lastSignedIn) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), NOW())`,
    ["demo-seller-001", "Demo Seller", "seller@demo.com", "+6282345678901", "+6282345678901", "seller", "active", true]
  );

  console.log("✅ Created demo seller user");

  // Create demo regular user
  const demoUserId = await connection.execute(
    `INSERT INTO users (openId, name, email, phone, whatsapp, role, subscriptionStatus, isPremium, createdAt, updatedAt, lastSignedIn) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), NOW())`,
    ["demo-user-001", "Demo User", "user@demo.com", "+6283456789012", "+6283456789012", "user", "free", false]
  );

  console.log("✅ Created demo regular user");

  // Create demo properties
  const sampleProperties = [
    {
      userId: demoSellerId[0].insertId,
      title: "Rumah Mewah di Jakarta Selatan",
      description:
        "Rumah modern dengan desain minimalis, dilengkapi dengan fasilitas lengkap.\n\nSpesifikasi:\n- Lokasi strategis di area premium\n- Dekat dengan pusat perbelanjaan dan sekolah\n- Keamanan 24 jam\n- Taman yang luas\n- Garasi untuk 2 mobil",
      propertyType: "house",
      address: "Jl. Sudirman No. 123, Jakarta Selatan",
      city: "Jakarta",
      province: "DKI Jakarta",
      postalCode: "12190",
      latitude: -6.2088,
      longitude: 106.7753,
      bedrooms: 4,
      bathrooms: 3,
      landSize: 500,
      buildingSize: 350,
      yearBuilt: 2020,
      price: 2500000000,
      status: "published",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1570129477492-45c003d96e1f?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1512917774080-9b274b5ce460?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1493857671505-72967e2e2760?w=800&h=600&fit=crop",
      ]),
      imageCount: 5,
      sellerPhone: "+6281234567890",
      sellerWhatsapp: "+6281234567890",
    },
    {
      userId: demoSellerId[0].insertId,
      title: "Apartemen Premium di Pusat Kota",
      description:
        "Apartemen modern dengan pemandangan kota yang spektakuler.\n\nFasilitas:\n- Kolam renang\n- Gym\n- Lounge area\n- Keamanan 24 jam\n- Parkir basement",
      propertyType: "apartment",
      address: "Jl. Gatot Subroto No. 456, Jakarta Pusat",
      city: "Jakarta",
      province: "DKI Jakarta",
      postalCode: "12950",
      latitude: -6.2167,
      longitude: 106.8,
      bedrooms: 3,
      bathrooms: 2,
      landSize: 0,
      buildingSize: 150,
      yearBuilt: 2022,
      price: 1500000000,
      status: "published",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1545324418-cc1a9a6fded0?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1493857671505-72967e2e2760?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1512917774080-9b274b5ce460?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1570129477492-45c003d96e1f?w=800&h=600&fit=crop",
      ]),
      imageCount: 5,
      sellerPhone: "+6281234567890",
      sellerWhatsapp: "+6281234567890",
    },
    {
      userId: demoSellerId[0].insertId,
      title: "Tanah Kavling di Bintaro",
      description:
        "Tanah kavling siap bangun di area berkembang.\n\nKarakteristik:\n- Lokasi strategis\n- Dekat dengan stasiun\n- Akses mudah ke jalan tol\n- Lingkungan yang tenang\n- Potensi investasi tinggi",
      propertyType: "land",
      address: "Jl. Bintaro Utama, Tangerang Selatan",
      city: "Tangerang Selatan",
      province: "Banten",
      postalCode: "15224",
      latitude: -6.3056,
      longitude: 106.7478,
      bedrooms: 0,
      bathrooms: 0,
      landSize: 1000,
      buildingSize: 0,
      yearBuilt: 0,
      price: 800000000,
      status: "published",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1500382017468-7049fae79e74?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1469022563149-aa64dbd37dae?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1469022563149-aa64dbd37dae?w=800&h=600&fit=crop",
      ]),
      imageCount: 5,
      sellerPhone: "+6281234567890",
      sellerWhatsapp: "+6281234567890",
    },
  ];

  for (const prop of sampleProperties) {
    await connection.execute(
      `INSERT INTO properties (userId, title, description, propertyType, address, city, province, postalCode, latitude, longitude, bedrooms, bathrooms, landSize, buildingSize, yearBuilt, price, status, images, imageCount, sellerPhone, sellerWhatsapp, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        prop.userId,
        prop.title,
        prop.description,
        prop.propertyType,
        prop.address,
        prop.city,
        prop.province,
        prop.postalCode,
        prop.latitude,
        prop.longitude,
        prop.bedrooms,
        prop.bathrooms,
        prop.landSize,
        prop.buildingSize,
        prop.yearBuilt,
        prop.price,
        prop.status,
        prop.images,
        prop.imageCount,
        prop.sellerPhone,
        prop.sellerWhatsapp,
      ]
    );
  }

  console.log("✅ Created 3 demo properties");

  // Create demo payment
  await connection.execute(
    `INSERT INTO payments (userId, amount, currency, paymentMethod, transactionId, orderId, status, subscriptionDays, description, createdAt, updatedAt, completedAt) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), NOW())`,
    [
      demoUserId[0].insertId,
      99000,
      "IDR",
      "bank_transfer",
      "DEMO-TXN-001",
      "DEMO-ORDER-001",
      "success",
      30,
      "Premium Subscription - 30 days",
    ]
  );

  console.log("✅ Created demo payment");

  console.log("\n✨ Demo data seeding completed successfully!");
  console.log("\nDemo Accounts:");
  console.log("- Admin: admin@demo.com (openId: demo-admin-001)");
  console.log("- Seller: seller@demo.com (openId: demo-seller-001)");
  console.log("- User: user@demo.com (openId: demo-user-001)");
  console.log("\nNote: Use these openIds to test the application");
} catch (error) {
  console.error("❌ Error seeding demo data:", error);
  process.exit(1);
} finally {
  await connection.end();
}
