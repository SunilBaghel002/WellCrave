// seeder.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./models/User");
const Category = require("./models/Category");
const Product = require("./models/Product");
const Coupon = require("./models/Coupon");

const connectDB = require("./config/db");

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log("📦 Connected to database");

    const args = process.argv.slice(2);

    if (args.includes("--clear")) {
      console.log("🗑️  Clearing database...");
      await User.deleteMany({});
      await Category.deleteMany({});
      await Product.deleteMany({});
      await Coupon.deleteMany({});
      console.log("✅ Database cleared");
    }

    // Always create/update admin
    await createAdmin();

    if (!args.includes("--admin-only")) {
      await createCategories();
      await createProducts();
      await createCoupons();
    }

    console.log("\n✅ Database seeded successfully!\n");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
};

const createAdmin = async () => {
  console.log("\n👤 Creating admin user...");

  const adminEmail = "admin@dehydratedfoods.com";
  const adminPassword = "Admin@123456";

  try {
    // Delete existing admin and create fresh
    await User.deleteOne({ email: adminEmail });

    // Hash password manually to ensure it works
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    // Create admin directly with hashed password
    const admin = await User.create({
      firstName: "Admin",
      lastName: "User",
      email: adminEmail,
      password: hashedPassword,
      role: "admin",
      isEmailVerified: true,
      isActive: true,
      authProvider: "local",
    });

    // Verify the password works
    const testUser = await User.findOne({ email: adminEmail }).select(
      "+password"
    );
    const isMatch = await bcrypt.compare(adminPassword, testUser.password);

    console.log("   ✅ Admin user created");
    console.log(`   📧 Email: ${adminEmail}`);
    console.log(`   🔑 Password: ${adminPassword}`);
    console.log(`   ✓ Password verification: ${isMatch ? "PASSED" : "FAILED"}`);

    if (!isMatch) {
      console.log(
        "   ⚠️  Password verification failed, trying alternative method..."
      );

      // Alternative: Update password using save to trigger pre-save hook
      testUser.password = adminPassword;
      await testUser.save();

      const retest = await User.findOne({ email: adminEmail }).select(
        "+password"
      );
      const reMatch = await bcrypt.compare(adminPassword, retest.password);
      console.log(`   ✓ Re-verification: ${reMatch ? "PASSED" : "FAILED"}`);
    }

    return admin;
  } catch (error) {
    console.error("   ❌ Error creating admin:", error.message);
    throw error;
  }
};

const createCategories = async () => {
  console.log("\n📁 Creating categories...");

  const categories = [
    {
      name: "Fruits",
      description: "Premium dehydrated fruits packed with natural sweetness",
      icon: "🍎",
      isActive: true,
      isFeatured: true,
      displayOrder: 1,
    },
    {
      name: "Vegetables",
      description: "Nutrient-rich dehydrated vegetables",
      icon: "🥕",
      isActive: true,
      isFeatured: true,
      displayOrder: 2,
    },
    {
      name: "Herbs & Spices",
      description: "Aromatic dried herbs and spices",
      icon: "🌿",
      isActive: true,
      isFeatured: true,
      displayOrder: 3,
    },
    {
      name: "Trail Mixes",
      description: "Energy-packed trail mixes",
      icon: "🥜",
      isActive: true,
      isFeatured: true,
      displayOrder: 4,
    },
  ];

  for (const cat of categories) {
    await Category.findOneAndUpdate({ name: cat.name }, cat, {
      upsert: true,
      new: true,
    });
  }

  console.log(`   ✅ ${categories.length} categories created`);
};

const createProducts = async () => {
  console.log("\n📦 Creating products...");

  const fruitsCategory = await Category.findOne({ name: "Fruits" });
  const veggiesCategory = await Category.findOne({ name: "Vegetables" });
  const trailMixCategory = await Category.findOne({ name: "Trail Mixes" });

  if (!fruitsCategory) {
    console.log("   ⚠️  Categories not found, skipping products");
    return;
  }

  const products = [
    {
      name: "Premium Freeze-Dried Strawberries",
      description:
        "Delicious freeze-dried strawberries with 97% nutrients preserved.",
      shortDescription: "Crispy, sweet freeze-dried strawberries",
      category: fruitsCategory._id,
      images: [
        {
          url: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=800",
          isPrimary: true,
        },
      ],
      variants: [
        {
          size: "Small",
          weight: 50,
          weightUnit: "g",
          price: 299,
          compareAtPrice: 349,
          sku: "STR-50",
          stock: 100,
          isAvailable: true,
        },
        {
          size: "Medium",
          weight: 100,
          weightUnit: "g",
          price: 549,
          sku: "STR-100",
          stock: 75,
          isAvailable: true,
        },
      ],
      basePrice: 299,
      compareAtPrice: 349,
      ingredients: ["Strawberries"],
      dietaryInfo: ["vegan", "gluten-free"],
      processingMethod: "freeze-dried",
      isFeatured: true,
      isNewArrival: true,
      tags: ["strawberry", "fruit"],
    },
    {
      name: "Organic Mango Slices",
      description: "Sweet organic mango slices with no added sugar.",
      shortDescription: "Naturally sweet organic mango",
      category: fruitsCategory._id,
      images: [
        {
          url: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=800",
          isPrimary: true,
        },
      ],
      variants: [
        {
          size: "Small",
          weight: 75,
          weightUnit: "g",
          price: 349,
          sku: "MNG-75",
          stock: 80,
          isAvailable: true,
        },
        {
          size: "Large",
          weight: 150,
          weightUnit: "g",
          price: 649,
          sku: "MNG-150",
          stock: 60,
          isAvailable: true,
        },
      ],
      basePrice: 349,
      ingredients: ["Organic Mangoes"],
      dietaryInfo: ["vegan", "organic"],
      processingMethod: "air-dried",
      isFeatured: true,
      isBestSeller: true,
      tags: ["mango", "organic"],
    },
    {
      name: "Mixed Vegetable Chips",
      description: "Crunchy vegetable chips with sea salt.",
      shortDescription: "Healthy veggie chips",
      category: veggiesCategory._id,
      images: [
        {
          url: "https://images.unsplash.com/photo-1621447504864-d8686e12698c?w=800",
          isPrimary: true,
        },
      ],
      variants: [
        {
          size: "Snack",
          weight: 40,
          weightUnit: "g",
          price: 149,
          sku: "VEG-40",
          stock: 150,
          isAvailable: true,
        },
        {
          size: "Family",
          weight: 120,
          weightUnit: "g",
          price: 399,
          sku: "VEG-120",
          stock: 100,
          isAvailable: true,
        },
      ],
      basePrice: 149,
      ingredients: ["Sweet Potato", "Beetroot", "Sea Salt"],
      dietaryInfo: ["vegan", "gluten-free"],
      processingMethod: "vacuum-dried",
      isFeatured: true,
      tags: ["vegetables", "chips"],
    },
    {
      name: "Adventure Trail Mix",
      description: "Energy-packed trail mix for outdoor adventures.",
      shortDescription: "Energizing trail mix",
      category: trailMixCategory._id,
      images: [
        {
          url: "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=800",
          isPrimary: true,
        },
      ],
      variants: [
        {
          size: "Pouch",
          weight: 100,
          weightUnit: "g",
          price: 299,
          sku: "TRL-100",
          stock: 120,
          isAvailable: true,
        },
        {
          size: "Value",
          weight: 250,
          weightUnit: "g",
          price: 649,
          sku: "TRL-250",
          stock: 80,
          isAvailable: true,
        },
      ],
      basePrice: 299,
      ingredients: ["Almonds", "Cashews", "Dried Fruits"],
      allergens: ["nuts"],
      dietaryInfo: ["vegetarian"],
      processingMethod: "freeze-dried",
      isFeatured: true,
      isNewArrival: true,
      tags: ["trail mix", "energy"],
    },
  ];

  for (const prod of products) {
    await Product.findOneAndUpdate({ name: prod.name }, prod, {
      upsert: true,
      new: true,
    });
  }

  console.log(`   ✅ ${products.length} products created`);

  // Update category counts
  const categories = await Category.find({});
  for (const cat of categories) {
    await Category.updateProductCount(cat._id);
  }
};

const createCoupons = async () => {
  console.log("\n🎟️  Creating coupons...");

  const coupons = [
    {
      code: "WELCOME10",
      description: "10% off first order",
      discountType: "percentage",
      discountValue: 10,
      minimumPurchase: 500,
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      isActive: true,
      isFirstOrderOnly: true,
    },
    {
      code: "FLAT100",
      description: "₹100 off on orders above ₹599",
      discountType: "fixed",
      discountValue: 100,
      minimumPurchase: 599,
      startDate: new Date(),
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      isActive: true,
    },
  ];

  for (const coupon of coupons) {
    await Coupon.findOneAndUpdate({ code: coupon.code }, coupon, {
      upsert: true,
      new: true,
    });
  }

  console.log(`   ✅ ${coupons.length} coupons created`);
};

seedDatabase();
