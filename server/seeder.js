// server/seeder.js
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

  const adminEmail = "admin@wellcrave.com";
  const adminPassword = "Admin@123456";

  try {
    await User.deleteOne({ email: adminEmail });

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

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

    const testUser = await User.findOne({ email: adminEmail }).select(
      "+password"
    );
    const isMatch = await bcrypt.compare(adminPassword, testUser.password);

    console.log("   ✅ Admin user created");
    console.log(`   📧 Email: ${adminEmail}`);
    console.log(`   🔑 Password: ${adminPassword}`);
    console.log(`   ✓ Password verification: ${isMatch ? "PASSED" : "FAILED"}`);

    if (!isMatch) {
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
      name: "Dry Fruits",
      slug: "dry-fruits",
      description:
        "Premium quality dry fruits and nuts for a healthy lifestyle",
      icon: "🥜",
      image: {
        url: "https://images.unsplash.com/photo-1608797178974-15b35a64ede9?w=800&q=80",
        alt: "Assorted dry fruits and nuts",
      },
      isActive: true,
      isFeatured: true,
      displayOrder: 1,
    },
    {
      name: "Dehydrated Fruits",
      slug: "dehydrated-fruits",
      description:
        "Naturally dried fruits with no added sugar or preservatives",
      icon: "🍎",
      image: {
        url: "https://images.unsplash.com/photo-1596591868231-05e882a36465?w=800&q=80",
        alt: "Colorful dehydrated fruits",
      },
      isActive: true,
      isFeatured: true,
      displayOrder: 2,
    },
    {
      name: "Spices & Masalas",
      slug: "spices-masalas",
      description: "Authentic Indian spices and masala blends",
      icon: "🌶️",
      image: {
        url: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&q=80",
        alt: "Traditional Indian spices",
      },
      isActive: true,
      isFeatured: true,
      displayOrder: 3,
    },
    {
      name: "Trail Mixes",
      slug: "trail-mixes",
      description: "Energy-packed trail mixes for active lifestyles",
      icon: "🎒",
      image: {
        url: "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=800&q=80",
        alt: "Healthy trail mix varieties",
      },
      isActive: true,
      isFeatured: true,
      displayOrder: 4,
    },
    {
      name: "Traditional Snacks",
      slug: "traditional-snacks",
      description: "Authentic Indian traditional snacks and namkeens",
      icon: "🍘",
      image: {
        url: "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=800&q=80",
        alt: "Indian traditional snacks",
      },
      isActive: true,
      isFeatured: true,
      displayOrder: 5,
    },
    {
      name: "Seeds & Superfoods",
      slug: "seeds-superfoods",
      description: "Nutrient-rich seeds and superfoods for optimal health",
      icon: "🌻",
      image: {
        url: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&q=80",
        alt: "Healthy seeds and superfoods",
      },
      isActive: true,
      isFeatured: true,
      displayOrder: 6,
    },
  ];

  for (const cat of categories) {
    await Category.findOneAndUpdate({ slug: cat.slug }, cat, {
      upsert: true,
      new: true,
    });
  }

  console.log(`   ✅ ${categories.length} categories created`);
};

const createProducts = async () => {
  console.log("\n📦 Creating products...");

  const dryFruitsCategory = await Category.findOne({ slug: "dry-fruits" });
  const dehydratedFruitsCategory = await Category.findOne({
    slug: "dehydrated-fruits",
  });
  const spicesCategory = await Category.findOne({ slug: "spices-masalas" });
  const trailMixCategory = await Category.findOne({ slug: "trail-mixes" });
  const snacksCategory = await Category.findOne({ slug: "traditional-snacks" });
  const seedsCategory = await Category.findOne({ slug: "seeds-superfoods" });

  if (!dryFruitsCategory) {
    console.log("   ⚠️  Categories not found, skipping products");
    return;
  }

  const products = [
    // ========== DRY FRUITS ==========
    {
      name: "Premium California Almonds (Badam)",
      slug: "premium-california-almonds-badam",
      description:
        "Hand-picked California almonds known for their rich, buttery taste and crunchy texture. These almonds are packed with protein, healthy fats, and vitamin E. Perfect for snacking or adding to your favorite recipes.",
      shortDescription: "Crunchy and nutritious California almonds",
      category: dryFruitsCategory._id,
      brand: "WellCrave",
      images: [
        {
          url: "https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=800&q=80",
          alt: "Premium California Almonds",
          isPrimary: true,
        },
      ],
      variants: [
        {
          size: "Small Pack",
          weight: 250,
          weightUnit: "g",
          price: 299,
          compareAtPrice: 349,
          sku: "ALM-250",
          stock: 150,
          isAvailable: true,
        },
        {
          size: "Family Pack",
          weight: 500,
          weightUnit: "g",
          price: 549,
          compareAtPrice: 649,
          sku: "ALM-500",
          stock: 100,
          isAvailable: true,
        },
        {
          size: "Value Pack",
          weight: 1000,
          weightUnit: "g",
          price: 999,
          compareAtPrice: 1199,
          sku: "ALM-1000",
          stock: 75,
          isAvailable: true,
        },
      ],
      basePrice: 299,
      compareAtPrice: 349,
      nutrition: {
        servingSize: "30g",
        calories: 170,
        totalFat: 15,
        saturatedFat: 1,
        cholesterol: 0,
        sodium: 0,
        totalCarbohydrates: 6,
        dietaryFiber: 3,
        sugars: 1,
        protein: 6,
      },
      ingredients: ["100% Natural California Almonds"],
      allergens: ["tree-nuts"],
      dietaryInfo: ["vegan", "gluten-free", "keto"],
      shelfLife: { duration: 12, unit: "months" },
      storageInstructions:
        "Store in a cool, dry place away from direct sunlight.",
      origin: { country: "USA", region: "California" },
      isFeatured: true,
      isBestSeller: true,
      isNewArrival: false,
      tags: ["almonds", "badam", "dry fruits", "protein", "healthy snack"],
    },
    {
      name: "Premium Cashews W240 (Kaju)",
      slug: "premium-cashews-w240-kaju",
      description:
        "Creamy and delicious whole cashews sourced from the finest farms of Goa. Our cashews are carefully selected for their size and taste, perfect for snacking or cooking your favorite Indian sweets like kaju katli.",
      shortDescription: "Creamy whole cashews - W240 grade",
      category: dryFruitsCategory._id,
      brand: "WellCrave",
      images: [
        {
          url: "https://images.unsplash.com/photo-1604028693390-71c4ebe3b84f?w=800&q=80",
          alt: "Premium Cashews",
          isPrimary: true,
        },
      ],
      variants: [
        {
          size: "Small Pack",
          weight: 250,
          weightUnit: "g",
          price: 399,
          compareAtPrice: 449,
          sku: "CSH-250",
          stock: 120,
          isAvailable: true,
        },
        {
          size: "Family Pack",
          weight: 500,
          weightUnit: "g",
          price: 749,
          compareAtPrice: 849,
          sku: "CSH-500",
          stock: 80,
          isAvailable: true,
        },
      ],
      basePrice: 399,
      compareAtPrice: 449,
      nutrition: {
        servingSize: "30g",
        calories: 165,
        totalFat: 13,
        saturatedFat: 2,
        cholesterol: 0,
        sodium: 5,
        totalCarbohydrates: 9,
        dietaryFiber: 1,
        sugars: 2,
        protein: 5,
      },
      ingredients: ["100% Natural Cashews"],
      allergens: ["tree-nuts"],
      dietaryInfo: ["vegan", "gluten-free"],
      shelfLife: { duration: 12, unit: "months" },
      origin: { country: "India", region: "Goa" },
      isFeatured: true,
      isBestSeller: true,
      tags: ["cashews", "kaju", "dry fruits", "snack"],
    },
    {
      name: "Golden Raisins (Kishmish)",
      slug: "golden-raisins-kishmish",
      description:
        "Sweet and plump golden raisins from the finest Thompson seedless grapes of Nashik. Perfect for adding natural sweetness to your desserts, cereals, kheer, or enjoying as a healthy snack.",
      shortDescription: "Sweet golden raisins - naturally dried",
      category: dryFruitsCategory._id,
      brand: "WellCrave",
      images: [
        {
          url: "https://images.unsplash.com/photo-1596591868231-05e882a36465?w=800&q=80",
          alt: "Golden Raisins",
          isPrimary: true,
        },
      ],
      variants: [
        {
          size: "Regular",
          weight: 250,
          weightUnit: "g",
          price: 149,
          sku: "RSN-250",
          stock: 200,
          isAvailable: true,
        },
        {
          size: "Value Pack",
          weight: 500,
          weightUnit: "g",
          price: 279,
          sku: "RSN-500",
          stock: 150,
          isAvailable: true,
        },
      ],
      basePrice: 149,
      nutrition: {
        servingSize: "30g",
        calories: 90,
        totalFat: 0,
        saturatedFat: 0,
        cholesterol: 0,
        sodium: 5,
        totalCarbohydrates: 24,
        dietaryFiber: 1,
        sugars: 18,
        protein: 1,
      },
      ingredients: ["Thompson Seedless Grapes"],
      dietaryInfo: ["vegan", "gluten-free"],
      shelfLife: { duration: 12, unit: "months" },
      origin: { country: "India", region: "Nashik" },
      isFeatured: false,
      isNewArrival: true,
      tags: ["raisins", "kishmish", "dry fruits"],
    },
    {
      name: "Kashmiri Walnuts (Akhrot)",
      slug: "kashmiri-walnuts-akhrot",
      description:
        "Premium Kashmiri walnuts known for their light color and delicate flavor. Rich in omega-3 fatty acids, these walnuts are excellent for brain health and make a great addition to salads, desserts, and halwa.",
      shortDescription: "Light Kashmiri walnuts - brain food",
      category: dryFruitsCategory._id,
      brand: "WellCrave",
      images: [
        {
          url: "https://images.unsplash.com/photo-1563412885-139e4125d7cd?w=800&q=80",
          alt: "Kashmiri Walnuts",
          isPrimary: true,
        },
      ],
      variants: [
        {
          size: "Regular",
          weight: 250,
          weightUnit: "g",
          price: 449,
          compareAtPrice: 499,
          sku: "WLN-250",
          stock: 100,
          isAvailable: true,
        },
        {
          size: "Premium Pack",
          weight: 500,
          weightUnit: "g",
          price: 849,
          compareAtPrice: 949,
          sku: "WLN-500",
          stock: 60,
          isAvailable: true,
        },
      ],
      basePrice: 449,
      compareAtPrice: 499,
      nutrition: {
        servingSize: "30g",
        calories: 200,
        totalFat: 20,
        saturatedFat: 2,
        cholesterol: 0,
        sodium: 0,
        totalCarbohydrates: 4,
        dietaryFiber: 2,
        sugars: 1,
        protein: 5,
      },
      ingredients: ["100% Kashmiri Walnuts"],
      allergens: ["tree-nuts"],
      dietaryInfo: ["vegan", "gluten-free", "keto"],
      shelfLife: { duration: 10, unit: "months" },
      origin: { country: "India", region: "Kashmir" },
      isFeatured: true,
      tags: ["walnuts", "akhrot", "omega-3", "brain health"],
    },
    {
      name: "Afghani Anjeer (Dried Figs)",
      slug: "afghani-anjeer-dried-figs",
      description:
        "Premium quality dried figs imported from Afghanistan. Naturally sweet and packed with fiber, calcium, and potassium. Soak them overnight in milk for best taste or enjoy them as they are.",
      shortDescription: "Premium Afghani dried figs",
      category: dryFruitsCategory._id,
      brand: "WellCrave",
      images: [
        {
          url: "https://images.unsplash.com/photo-1601379760883-1bb497c558ea?w=800&q=80",
          alt: "Afghani Anjeer",
          isPrimary: true,
        },
      ],
      variants: [
        {
          size: "Regular",
          weight: 200,
          weightUnit: "g",
          price: 349,
          sku: "FIG-200",
          stock: 80,
          isAvailable: true,
        },
        {
          size: "Premium",
          weight: 400,
          weightUnit: "g",
          price: 649,
          sku: "FIG-400",
          stock: 50,
          isAvailable: true,
        },
      ],
      basePrice: 349,
      nutrition: {
        servingSize: "40g",
        calories: 100,
        totalFat: 0,
        saturatedFat: 0,
        cholesterol: 0,
        sodium: 5,
        totalCarbohydrates: 26,
        dietaryFiber: 4,
        sugars: 20,
        protein: 1,
      },
      ingredients: ["100% Dried Figs"],
      dietaryInfo: ["vegan", "gluten-free", "high-protein"],
      shelfLife: { duration: 12, unit: "months" },
      origin: { country: "Afghanistan", region: "Kabul" },
      isFeatured: true,
      isNewArrival: true,
      tags: ["anjeer", "figs", "fiber", "dry fruits"],
    },
    {
      name: "Premium Pistachios Salted (Pista)",
      slug: "premium-pistachios-salted-pista",
      description:
        "Roasted and lightly salted Iranian pistachios with shells. Rich in protein, fiber, and antioxidants. The perfect snack for health-conscious individuals.",
      shortDescription: "Roasted salted pistachios",
      category: dryFruitsCategory._id,
      brand: "WellCrave",
      images: [
        {
          url: "https://images.unsplash.com/photo-1525706373121-64e0a87b3cd0?w=800&q=80",
          alt: "Premium Pistachios",
          isPrimary: true,
        },
      ],
      variants: [
        {
          size: "Regular",
          weight: 200,
          weightUnit: "g",
          price: 399,
          compareAtPrice: 449,
          sku: "PST-200",
          stock: 90,
          isAvailable: true,
        },
        {
          size: "Premium",
          weight: 400,
          weightUnit: "g",
          price: 749,
          compareAtPrice: 849,
          sku: "PST-400",
          stock: 60,
          isAvailable: true,
        },
      ],
      basePrice: 399,
      compareAtPrice: 449,
      nutrition: {
        servingSize: "30g",
        calories: 160,
        totalFat: 13,
        saturatedFat: 2,
        cholesterol: 0,
        sodium: 120,
        totalCarbohydrates: 8,
        dietaryFiber: 3,
        sugars: 2,
        protein: 6,
      },
      ingredients: ["Pistachios", "Salt"],
      allergens: ["tree-nuts"],
      dietaryInfo: ["vegan", "gluten-free"],
      shelfLife: { duration: 10, unit: "months" },
      origin: { country: "Iran", region: "Kerman" },
      isFeatured: true,
      isBestSeller: true,
      tags: ["pistachios", "pista", "roasted", "salted"],
    },

    // ========== DEHYDRATED FRUITS ==========
    {
      name: "Freeze-Dried Alphonso Mango Slices",
      slug: "freeze-dried-alphonso-mango-slices",
      description:
        "Authentic Alphonso mango slices from Ratnagiri, freeze-dried to perfection. Retains 97% of the nutrients and the natural sweetness of fresh mangoes. Perfect for snacking or adding to smoothies and desserts.",
      shortDescription: "Crispy Alphonso mango slices",
      category: dehydratedFruitsCategory._id,
      brand: "WellCrave",
      images: [
        {
          url: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=800&q=80",
          alt: "Freeze-dried Mango Slices",
          isPrimary: true,
        },
      ],
      variants: [
        {
          size: "Snack Pack",
          weight: 50,
          weightUnit: "g",
          price: 199,
          sku: "MNG-50",
          stock: 150,
          isAvailable: true,
        },
        {
          size: "Regular",
          weight: 100,
          weightUnit: "g",
          price: 349,
          sku: "MNG-100",
          stock: 100,
          isAvailable: true,
        },
      ],
      basePrice: 199,
      nutrition: {
        servingSize: "25g",
        calories: 90,
        totalFat: 0,
        saturatedFat: 0,
        cholesterol: 0,
        sodium: 0,
        totalCarbohydrates: 23,
        dietaryFiber: 2,
        sugars: 18,
        protein: 1,
      },
      ingredients: ["Alphonso Mangoes"],
      dietaryInfo: ["vegan", "gluten-free", "organic"],
      processingMethod: "freeze-dried",
      shelfLife: { duration: 18, unit: "months" },
      origin: { country: "India", region: "Ratnagiri" },
      isFeatured: true,
      isBestSeller: true,
      tags: ["mango", "alphonso", "freeze-dried", "indian fruit"],
    },
    {
      name: "Dehydrated Strawberry Crisps",
      slug: "dehydrated-strawberry-crisps",
      description:
        "Crunchy dehydrated strawberries that burst with natural sweetness. Made from farm-fresh Mahabaleshwar strawberries. Great for cereals, desserts, or healthy snacking.",
      shortDescription: "Crunchy strawberry crisps",
      category: dehydratedFruitsCategory._id,
      brand: "WellCrave",
      images: [
        {
          url: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=800&q=80",
          alt: "Dehydrated Strawberries",
          isPrimary: true,
        },
      ],
      variants: [
        {
          size: "Snack Pack",
          weight: 40,
          weightUnit: "g",
          price: 179,
          sku: "STR-40",
          stock: 120,
          isAvailable: true,
        },
        {
          size: "Regular",
          weight: 80,
          weightUnit: "g",
          price: 329,
          sku: "STR-80",
          stock: 80,
          isAvailable: true,
        },
      ],
      basePrice: 179,
      nutrition: {
        servingSize: "20g",
        calories: 70,
        totalFat: 0,
        saturatedFat: 0,
        cholesterol: 0,
        sodium: 0,
        totalCarbohydrates: 17,
        dietaryFiber: 2,
        sugars: 12,
        protein: 1,
      },
      ingredients: ["Fresh Strawberries"],
      dietaryInfo: ["vegan", "gluten-free"],
      processingMethod: "air-dried",
      shelfLife: { duration: 12, unit: "months" },
      origin: { country: "India", region: "Mahabaleshwar" },
      isFeatured: true,
      isNewArrival: true,
      tags: ["strawberry", "berries", "crispy", "snack"],
    },
    {
      name: "Kerala Banana Chips (Nendran)",
      slug: "kerala-banana-chips-nendran",
      description:
        "Crispy Kerala-style banana chips made from premium Nendran bananas, fried in pure coconut oil. Lightly salted and absolutely addictive. A traditional South Indian snack loved by all.",
      shortDescription: "Crispy Kerala banana chips",
      category: dehydratedFruitsCategory._id,
      brand: "WellCrave",
      images: [
        {
          url: "https://images.unsplash.com/photo-1621447504864-d8686e12698c?w=800&q=80",
          alt: "Banana Chips",
          isPrimary: true,
        },
      ],
      variants: [
        {
          size: "Snack Pack",
          weight: 100,
          weightUnit: "g",
          price: 99,
          sku: "BAN-100",
          stock: 200,
          isAvailable: true,
        },
        {
          size: "Family Pack",
          weight: 250,
          weightUnit: "g",
          price: 229,
          sku: "BAN-250",
          stock: 150,
          isAvailable: true,
        },
      ],
      basePrice: 99,
      nutrition: {
        servingSize: "30g",
        calories: 150,
        totalFat: 9,
        saturatedFat: 7,
        cholesterol: 0,
        sodium: 85,
        totalCarbohydrates: 17,
        dietaryFiber: 1,
        sugars: 3,
        protein: 1,
      },
      ingredients: ["Nendran Bananas", "Coconut Oil", "Sea Salt"],
      dietaryInfo: ["vegan", "gluten-free"],
      shelfLife: { duration: 6, unit: "months" },
      origin: { country: "India", region: "Kerala" },
      isFeatured: false,
      isBestSeller: true,
      tags: ["banana chips", "kerala", "snack", "traditional"],
    },

    // ========== SPICES & MASALAS ==========
    {
      name: "Kashmiri Red Chilli Powder (Deghi Mirch)",
      slug: "kashmiri-red-chilli-powder-deghi-mirch",
      description:
        "Authentic Kashmiri red chilli powder known for its vibrant color and mild heat. Perfect for adding beautiful red color to your curries, biryanis, and tandoori dishes without overwhelming spice.",
      shortDescription: "Vibrant color, mild heat",
      category: spicesCategory._id,
      brand: "WellCrave",
      images: [
        {
          url: "https://images.unsplash.com/photo-1599909533681-74d5b7b645fe?w=800&q=80",
          alt: "Kashmiri Red Chilli Powder",
          isPrimary: true,
        },
      ],
      variants: [
        {
          size: "Regular",
          weight: 100,
          weightUnit: "g",
          price: 129,
          sku: "KRC-100",
          stock: 180,
          isAvailable: true,
        },
        {
          size: "Kitchen Pack",
          weight: 250,
          weightUnit: "g",
          price: 299,
          sku: "KRC-250",
          stock: 120,
          isAvailable: true,
        },
      ],
      basePrice: 129,
      ingredients: ["100% Kashmiri Red Chillies"],
      dietaryInfo: ["vegan", "gluten-free"],
      processingMethod: "sun-dried",
      shelfLife: { duration: 18, unit: "months" },
      origin: { country: "India", region: "Kashmir" },
      isFeatured: true,
      tags: ["kashmiri", "chilli", "spice", "masala"],
    },
    {
      name: "Organic Turmeric Powder (Haldi)",
      slug: "organic-turmeric-powder-haldi",
      description:
        "Premium organic turmeric from the farms of Erode, Tamil Nadu. High curcumin content (3-5%) for maximum health benefits. Essential for every Indian kitchen - from dal to chai.",
      shortDescription: "High curcumin organic turmeric",
      category: spicesCategory._id,
      brand: "WellCrave",
      images: [
        {
          url: "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=800&q=80",
          alt: "Organic Turmeric Powder",
          isPrimary: true,
        },
      ],
      variants: [
        {
          size: "Regular",
          weight: 100,
          weightUnit: "g",
          price: 79,
          sku: "TRM-100",
          stock: 200,
          isAvailable: true,
        },
        {
          size: "Value Pack",
          weight: 250,
          weightUnit: "g",
          price: 179,
          sku: "TRM-250",
          stock: 150,
          isAvailable: true,
        },
      ],
      basePrice: 79,
      ingredients: ["100% Organic Turmeric"],
      dietaryInfo: ["vegan", "gluten-free", "organic"],
      certifications: ["usda-organic"],
      shelfLife: { duration: 24, unit: "months" },
      origin: { country: "India", region: "Erode, Tamil Nadu" },
      isFeatured: true,
      isBestSeller: true,
      tags: ["turmeric", "haldi", "organic", "spice"],
    },
    {
      name: "Aromatic Garam Masala Blend",
      slug: "aromatic-garam-masala-blend",
      description:
        "A perfect blend of 13 aromatic spices including cinnamon, cardamom, cloves, black pepper, and more. Freshly ground to preserve aroma. Adds depth and warmth to all your curries and biryanis.",
      shortDescription: "Aromatic 13-spice blend",
      category: spicesCategory._id,
      brand: "WellCrave",
      images: [
        {
          url: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&q=80",
          alt: "Garam Masala",
          isPrimary: true,
        },
      ],
      variants: [
        {
          size: "Regular",
          weight: 100,
          weightUnit: "g",
          price: 149,
          sku: "GRM-100",
          stock: 150,
          isAvailable: true,
        },
        {
          size: "Kitchen Pack",
          weight: 200,
          weightUnit: "g",
          price: 269,
          sku: "GRM-200",
          stock: 100,
          isAvailable: true,
        },
      ],
      basePrice: 149,
      ingredients: [
        "Cinnamon",
        "Green Cardamom",
        "Cloves",
        "Black Pepper",
        "Cumin Seeds",
        "Coriander Seeds",
        "Bay Leaves",
        "Nutmeg",
        "Mace",
        "Star Anise",
        "Fennel Seeds",
        "Black Cardamom",
        "Dried Ginger",
      ],
      dietaryInfo: ["vegan", "gluten-free"],
      shelfLife: { duration: 12, unit: "months" },
      origin: { country: "India" },
      isFeatured: false,
      isNewArrival: true,
      tags: ["garam masala", "spice blend", "indian spices"],
    },

    // ========== TRAIL MIXES ==========
    {
      name: "Energy Booster Trail Mix",
      slug: "energy-booster-trail-mix",
      description:
        "A power-packed mix of almonds, cashews, walnuts, dried cranberries, and pumpkin seeds. Perfect pre or post-workout snack for sustained energy. No added sugar or preservatives.",
      shortDescription: "Power-packed energy mix",
      category: trailMixCategory._id,
      brand: "WellCrave",
      images: [
        {
          url: "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=800&q=80",
          alt: "Energy Trail Mix",
          isPrimary: true,
        },
      ],
      variants: [
        {
          size: "Pouch",
          weight: 150,
          weightUnit: "g",
          price: 349,
          sku: "ETM-150",
          stock: 100,
          isAvailable: true,
        },
        {
          size: "Jar",
          weight: 300,
          weightUnit: "g",
          price: 649,
          sku: "ETM-300",
          stock: 80,
          isAvailable: true,
        },
      ],
      basePrice: 349,
      nutrition: {
        servingSize: "30g",
        calories: 160,
        totalFat: 12,
        saturatedFat: 1,
        cholesterol: 0,
        sodium: 5,
        totalCarbohydrates: 10,
        dietaryFiber: 2,
        sugars: 5,
        protein: 5,
      },
      ingredients: [
        "Almonds",
        "Cashews",
        "Walnuts",
        "Dried Cranberries",
        "Pumpkin Seeds",
      ],
      allergens: ["tree-nuts"],
      dietaryInfo: ["vegetarian", "gluten-free", "high-protein"],
      shelfLife: { duration: 8, unit: "months" },
      isFeatured: true,
      isBestSeller: true,
      tags: ["trail mix", "energy", "protein", "workout"],
    },
    {
      name: "Antioxidant Berry Mix",
      slug: "antioxidant-berry-mix",
      description:
        "A delicious blend of dried blueberries, cranberries, goji berries, and mulberries. Packed with antioxidants for your daily wellness boost. Great for smoothies, breakfast bowls, or snacking.",
      shortDescription: "Berry-rich antioxidant blend",
      category: trailMixCategory._id,
      brand: "WellCrave",
      images: [
        {
          url: "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=800&q=80",
          alt: "Antioxidant Berry Mix",
          isPrimary: true,
        },
      ],
      variants: [
        {
          size: "Regular",
          weight: 100,
          weightUnit: "g",
          price: 299,
          sku: "ABM-100",
          stock: 120,
          isAvailable: true,
        },
        {
          size: "Value Pack",
          weight: 200,
          weightUnit: "g",
          price: 549,
          sku: "ABM-200",
          stock: 80,
          isAvailable: true,
        },
      ],
      basePrice: 299,
      nutrition: {
        servingSize: "30g",
        calories: 100,
        totalFat: 0,
        saturatedFat: 0,
        cholesterol: 0,
        sodium: 0,
        totalCarbohydrates: 24,
        dietaryFiber: 3,
        sugars: 18,
        protein: 1,
      },
      ingredients: ["Blueberries", "Cranberries", "Goji Berries", "Mulberries"],
      dietaryInfo: ["vegan", "gluten-free"],
      shelfLife: { duration: 10, unit: "months" },
      isFeatured: true,
      isNewArrival: true,
      tags: ["berries", "antioxidant", "superfood", "healthy"],
    },
    {
      name: "Desi Mix (Indian Trail Mix)",
      slug: "desi-mix-indian-trail-mix",
      description:
        "A traditional Indian snack mix with roasted chana, moong dal, peanuts, curry leaves, and a hint of spices. The perfect chai-time companion. Crunchy, savory, and irresistible!",
      shortDescription: "Spiced Indian snack mix",
      category: trailMixCategory._id,
      brand: "WellCrave",
      images: [
        {
          url: "https://images.unsplash.com/photo-1606923829579-0cb981a83e2e?w=800&q=80",
          alt: "Desi Trail Mix",
          isPrimary: true,
        },
      ],
      variants: [
        {
          size: "Regular",
          weight: 200,
          weightUnit: "g",
          price: 149,
          sku: "DTM-200",
          stock: 150,
          isAvailable: true,
        },
        {
          size: "Family Pack",
          weight: 400,
          weightUnit: "g",
          price: 279,
          sku: "DTM-400",
          stock: 100,
          isAvailable: true,
        },
      ],
      basePrice: 149,
      nutrition: {
        servingSize: "30g",
        calories: 130,
        totalFat: 6,
        saturatedFat: 1,
        cholesterol: 0,
        sodium: 150,
        totalCarbohydrates: 14,
        dietaryFiber: 3,
        sugars: 1,
        protein: 5,
      },
      ingredients: [
        "Roasted Chana",
        "Moong Dal",
        "Peanuts",
        "Curry Leaves",
        "Green Chillies",
        "Salt",
        "Turmeric",
      ],
      allergens: ["peanuts"],
      dietaryInfo: ["vegan", "gluten-free"],
      shelfLife: { duration: 6, unit: "months" },
      origin: { country: "India" },
      isFeatured: false,
      isBestSeller: true,
      tags: ["desi", "indian", "namkeen", "snack"],
    },

    // ========== TRADITIONAL SNACKS ==========
    {
      name: "Gujarati Methi Khakhra",
      slug: "gujarati-methi-khakhra",
      description:
        "Crispy Gujarati methi khakhra made with whole wheat flour and fresh fenugreek leaves. Hand-roasted for perfect crispness. A light and healthy snack that goes perfectly with pickle, chutney, or tea.",
      shortDescription: "Crispy Gujarati methi khakhra",
      category: snacksCategory._id,
      brand: "WellCrave",
      images: [
        {
          url: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&q=80",
          alt: "Methi Khakhra",
          isPrimary: true,
        },
      ],
      variants: [
        {
          size: "Regular",
          weight: 200,
          weightUnit: "g",
          price: 99,
          sku: "KHK-200",
          stock: 180,
          isAvailable: true,
        },
        {
          size: "Family Pack",
          weight: 400,
          weightUnit: "g",
          price: 179,
          sku: "KHK-400",
          stock: 120,
          isAvailable: true,
        },
      ],
      basePrice: 99,
      nutrition: {
        servingSize: "30g (2 pcs)",
        calories: 110,
        totalFat: 3,
        saturatedFat: 0,
        cholesterol: 0,
        sodium: 180,
        totalCarbohydrates: 18,
        dietaryFiber: 2,
        sugars: 0,
        protein: 3,
      },
      ingredients: [
        "Whole Wheat Flour",
        "Methi Leaves",
        "Oil",
        "Salt",
        "Ajwain",
        "Cumin",
      ],
      dietaryInfo: ["vegetarian"],
      shelfLife: { duration: 4, unit: "months" },
      origin: { country: "India", region: "Gujarat" },
      isFeatured: false,
      isBestSeller: true,
      tags: ["khakhra", "gujarati", "healthy snack", "traditional"],
    },
    {
      name: "South Indian Murukku",
      slug: "south-indian-murukku",
      description:
        "Authentic South Indian murukku (chakli) made with rice flour and urad dal. Crispy, savory spirals that are perfect for festivals like Diwali or everyday snacking. A tea-time favorite!",
      shortDescription: "Crispy South Indian murukku",
      category: snacksCategory._id,
      brand: "WellCrave",
      images: [
        {
          url: "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=800&q=80",
          alt: "South Indian Murukku",
          isPrimary: true,
        },
      ],
      variants: [
        {
          size: "Regular",
          weight: 250,
          weightUnit: "g",
          price: 149,
          sku: "MRK-250",
          stock: 150,
          isAvailable: true,
        },
        {
          size: "Party Pack",
          weight: 500,
          weightUnit: "g",
          price: 279,
          sku: "MRK-500",
          stock: 80,
          isAvailable: true,
        },
      ],
      basePrice: 149,
      nutrition: {
        servingSize: "30g",
        calories: 145,
        totalFat: 7,
        saturatedFat: 1,
        cholesterol: 0,
        sodium: 200,
        totalCarbohydrates: 18,
        dietaryFiber: 1,
        sugars: 0,
        protein: 2,
      },
      ingredients: [
        "Rice Flour",
        "Urad Dal",
        "Cumin Seeds",
        "Sesame Seeds",
        "Oil",
        "Salt",
        "Asafoetida",
      ],
      dietaryInfo: ["vegan", "gluten-free"],
      shelfLife: { duration: 3, unit: "months" },
      origin: { country: "India", region: "Tamil Nadu" },
      isFeatured: true,
      tags: ["murukku", "south indian", "traditional", "festival"],
    },

    // ========== SEEDS & SUPERFOODS ==========
    {
      name: "Raw Chia Seeds",
      slug: "raw-chia-seeds",
      description:
        "Premium quality chia seeds rich in omega-3, fiber, and protein. Perfect for making chia pudding, adding to smoothies, lemonade, or as a topping on your breakfast bowls.",
      shortDescription: "Omega-3 rich superfood seeds",
      category: seedsCategory._id,
      brand: "WellCrave",
      images: [
        {
          url: "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=800&q=80",
          alt: "Chia Seeds",
          isPrimary: true,
        },
      ],
      variants: [
        {
          size: "Regular",
          weight: 200,
          weightUnit: "g",
          price: 199,
          sku: "CHI-200",
          stock: 150,
          isAvailable: true,
        },
        {
          size: "Value Pack",
          weight: 400,
          weightUnit: "g",
          price: 349,
          sku: "CHI-400",
          stock: 100,
          isAvailable: true,
        },
      ],
      basePrice: 199,
      nutrition: {
        servingSize: "15g (1 tbsp)",
        calories: 70,
        totalFat: 4,
        saturatedFat: 0,
        cholesterol: 0,
        sodium: 0,
        totalCarbohydrates: 6,
        dietaryFiber: 5,
        sugars: 0,
        protein: 2,
      },
      ingredients: ["100% Chia Seeds"],
      dietaryInfo: ["vegan", "gluten-free", "keto", "raw"],
      shelfLife: { duration: 24, unit: "months" },
      isFeatured: true,
      isBestSeller: true,
      tags: ["chia seeds", "superfood", "omega-3", "protein"],
    },
    {
      name: "Roasted Flax Seeds (Alsi)",
      slug: "roasted-flax-seeds-alsi",
      description:
        "Lightly roasted flax seeds with a nutty flavor. Excellent source of lignans and omega-3 fatty acids. Add to your rotis, parathas, salads, or smoothies for extra nutrition.",
      shortDescription: "Nutty roasted flax seeds",
      category: seedsCategory._id,
      brand: "WellCrave",
      images: [
        {
          url: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&q=80",
          alt: "Roasted Flax Seeds",
          isPrimary: true,
        },
      ],
      variants: [
        {
          size: "Regular",
          weight: 200,
          weightUnit: "g",
          price: 149,
          sku: "FLX-200",
          stock: 130,
          isAvailable: true,
        },
        {
          size: "Value Pack",
          weight: 400,
          weightUnit: "g",
          price: 269,
          sku: "FLX-400",
          stock: 90,
          isAvailable: true,
        },
      ],
      basePrice: 149,
      nutrition: {
        servingSize: "15g (1 tbsp)",
        calories: 75,
        totalFat: 6,
        saturatedFat: 0,
        cholesterol: 0,
        sodium: 5,
        totalCarbohydrates: 4,
        dietaryFiber: 4,
        sugars: 0,
        protein: 3,
      },
      ingredients: ["Flax Seeds"],
      dietaryInfo: ["vegan", "gluten-free", "keto"],
      shelfLife: { duration: 12, unit: "months" },
      isFeatured: true,
      isNewArrival: true,
      tags: ["flax seeds", "alsi", "omega-3", "fiber"],
    },
    {
      name: "Raw Pumpkin Seeds",
      slug: "raw-pumpkin-seeds",
      description:
        "Premium raw pumpkin seeds (pepitas) packed with zinc, magnesium, and healthy fats. Great for snacking, adding crunch to salads, or topping your soups and curries.",
      shortDescription: "Zinc-rich pumpkin seeds",
      category: seedsCategory._id,
      brand: "WellCrave",
      images: [
        {
          url: "https://images.unsplash.com/photo-1622484212850-eb596d769edc?w=800&q=80",
          alt: "Pumpkin Seeds",
          isPrimary: true,
        },
      ],
      variants: [
        {
          size: "Regular",
          weight: 150,
          weightUnit: "g",
          price: 199,
          sku: "PMP-150",
          stock: 120,
          isAvailable: true,
        },
        {
          size: "Value Pack",
          weight: 300,
          weightUnit: "g",
          price: 369,
          sku: "PMP-300",
          stock: 80,
          isAvailable: true,
        },
      ],
      basePrice: 199,
      nutrition: {
        servingSize: "30g",
        calories: 160,
        totalFat: 14,
        saturatedFat: 2,
        cholesterol: 0,
        sodium: 5,
        totalCarbohydrates: 4,
        dietaryFiber: 2,
        sugars: 0,
        protein: 8,
      },
      ingredients: ["Raw Pumpkin Seeds"],
      dietaryInfo: ["vegan", "gluten-free", "keto"],
      shelfLife: { duration: 12, unit: "months" },
      isFeatured: false,
      tags: ["pumpkin seeds", "pepitas", "zinc", "healthy"],
    },
    {
      name: "Mixed Seeds Combo (4-in-1)",
      slug: "mixed-seeds-combo-4-in-1",
      description:
        "A perfect blend of chia seeds, flax seeds, pumpkin seeds, and sunflower seeds. All the benefits of superfoods in one convenient pack. Ideal for daily nutrition boost.",
      shortDescription: "4-in-1 superfood seeds mix",
      category: seedsCategory._id,
      brand: "WellCrave",
      images: [
        {
          url: "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=800&q=80",
          alt: "Mixed Seeds",
          isPrimary: true,
        },
      ],
      variants: [
        {
          size: "Regular",
          weight: 200,
          weightUnit: "g",
          price: 249,
          sku: "MSC-200",
          stock: 110,
          isAvailable: true,
        },
        {
          size: "Value Pack",
          weight: 400,
          weightUnit: "g",
          price: 449,
          sku: "MSC-400",
          stock: 70,
          isAvailable: true,
        },
      ],
      basePrice: 249,
      nutrition: {
        servingSize: "20g",
        calories: 110,
        totalFat: 8,
        saturatedFat: 1,
        cholesterol: 0,
        sodium: 0,
        totalCarbohydrates: 5,
        dietaryFiber: 3,
        sugars: 0,
        protein: 5,
      },
      ingredients: [
        "Chia Seeds",
        "Flax Seeds",
        "Pumpkin Seeds",
        "Sunflower Seeds",
      ],
      dietaryInfo: ["vegan", "gluten-free", "keto"],
      shelfLife: { duration: 12, unit: "months" },
      isFeatured: true,
      isBestSeller: true,
      tags: ["mixed seeds", "superfood", "combo"],
    },
  ];

  let createdCount = 0;
  let errorCount = 0;

  for (const prod of products) {
    try {
      await Product.findOneAndUpdate({ slug: prod.slug }, prod, {
        upsert: true,
        new: true,
      });
      createdCount++;
    } catch (error) {
      console.log(`   ⚠️  Error creating "${prod.name}": ${error.message}`);
      errorCount++;
    }
  }

  console.log(`   ✅ ${createdCount} products created`);
  if (errorCount > 0) {
    console.log(`   ⚠️  ${errorCount} products had errors`);
  }

  // Update category counts
  const categories = await Category.find({});
  for (const cat of categories) {
    try {
      const count = await Product.countDocuments({
        category: cat._id,
        isActive: true,
      });
      await Category.findByIdAndUpdate(cat._id, { productCount: count });
    } catch (error) {
      console.log(`   ⚠️  Error updating count for ${cat.name}`);
    }
  }
  console.log(`   ✅ Category counts updated`);
};

const createCoupons = async () => {
  console.log("\n🎟️  Creating coupons...");

  const coupons = [
    {
      code: "WELCOME10",
      description: "10% off on your first order",
      discountType: "percentage",
      discountValue: 10,
      minimumPurchase: 500,
      maximumDiscount: 200,
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
    {
      code: "DIWALI20",
      description: "20% off on festive orders",
      discountType: "percentage",
      discountValue: 20,
      minimumPurchase: 999,
      maximumDiscount: 500,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      isActive: true,
    },
    {
      code: "FREESHIP",
      description: "Free shipping on any order",
      discountType: "free_shipping",
      discountValue: 0,
      minimumPurchase: 0,
      startDate: new Date(),
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      isActive: true,
      usageLimit: 100,
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
