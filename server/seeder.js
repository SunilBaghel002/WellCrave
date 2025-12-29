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
    console.log("Connected to database");

    // Clear existing data
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Coupon.deleteMany({});

    console.log("Cleared existing data");

    // Create admin user
    const adminPassword = await bcrypt.hash("Admin@123", 12);
    const admin = await User.create({
      firstName: "Admin",
      lastName: "User",
      email: "admin@dehydratedfoods.com",
      password: adminPassword,
      role: "admin",
      isEmailVerified: true,
    });

    console.log("Created admin user");

    // Create categories
    const categories = await Category.create([
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
        description:
          "Nutrient-rich dehydrated vegetables for cooking and snacking",
        icon: "🥕",
        isActive: true,
        isFeatured: true,
        displayOrder: 2,
      },
      {
        name: "Herbs & Spices",
        description: "Aromatic dried herbs and spices for your kitchen",
        icon: "🌿",
        isActive: true,
        isFeatured: true,
        displayOrder: 3,
      },
      {
        name: "Meat & Jerky",
        description: "Protein-packed dehydrated meat products",
        icon: "🥩",
        isActive: true,
        isFeatured: false,
        displayOrder: 4,
      },
      {
        name: "Trail Mixes",
        description: "Perfect blends for hiking and outdoor adventures",
        icon: "🥜",
        isActive: true,
        isFeatured: true,
        displayOrder: 5,
      },
    ]);

    console.log("Created categories");

    // Create products
    const products = await Product.create([
      {
        name: "Premium Freeze-Dried Strawberries",
        description:
          "Our premium freeze-dried strawberries are picked at peak ripeness and processed using advanced freeze-drying technology to preserve 97% of nutrients. Perfect for snacking, cereals, or baking.",
        shortDescription:
          "Crispy, sweet, and nutritious freeze-dried strawberries",
        category: categories[0]._id,
        brand: "DehydratedFoods",
        images: [
          {
            url: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=800",
            isPrimary: true,
            alt: "Freeze-dried strawberries",
          },
        ],
        variants: [
          {
            size: "Small",
            weight: 50,
            weightUnit: "g",
            price: 12.99,
            compareAtPrice: 15.99,
            sku: "FDS-STR-50",
            stock: 100,
            isAvailable: true,
          },
          {
            size: "Medium",
            weight: 100,
            weightUnit: "g",
            price: 22.99,
            compareAtPrice: 27.99,
            sku: "FDS-STR-100",
            stock: 75,
            isAvailable: true,
          },
          {
            size: "Large",
            weight: 200,
            weightUnit: "g",
            price: 39.99,
            compareAtPrice: 49.99,
            sku: "FDS-STR-200",
            stock: 50,
            isAvailable: true,
          },
        ],
        basePrice: 12.99,
        compareAtPrice: 15.99,
        nutrition: {
          servingSize: "30g",
          calories: 100,
          totalFat: 0.5,
          sodium: 5,
          totalCarbohydrates: 24,
          dietaryFiber: 3,
          sugars: 18,
          protein: 1,
        },
        ingredients: ["Strawberries"],
        dietaryInfo: ["vegan", "gluten-free", "non-gmo"],
        processingMethod: "freeze-dried",
        shelfLife: { duration: 25, unit: "years" },
        isFeatured: true,
        isNewArrival: true,
        tags: ["strawberry", "fruit", "snack", "healthy"],
      },
      {
        name: "Organic Dehydrated Mango Slices",
        description:
          "Sweet and tangy organic mango slices, carefully dehydrated to lock in tropical flavor. No added sugars or preservatives.",
        shortDescription: "Naturally sweet organic mango slices",
        category: categories[0]._id,
        brand: "DehydratedFoods",
        images: [
          {
            url: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=800",
            isPrimary: true,
            alt: "Dehydrated mango slices",
          },
        ],
        variants: [
          {
            size: "Small",
            weight: 75,
            weightUnit: "g",
            price: 14.99,
            sku: "FDO-MNG-75",
            stock: 80,
            isAvailable: true,
          },
          {
            size: "Large",
            weight: 150,
            weightUnit: "g",
            price: 26.99,
            sku: "FDO-MNG-150",
            stock: 60,
            isAvailable: true,
          },
        ],
        basePrice: 14.99,
        nutrition: {
          servingSize: "30g",
          calories: 110,
          totalFat: 0,
          sodium: 0,
          totalCarbohydrates: 28,
          dietaryFiber: 2,
          sugars: 24,
          protein: 1,
        },
        ingredients: ["Organic Mangoes"],
        dietaryInfo: ["vegan", "gluten-free", "organic", "non-gmo"],
        processingMethod: "air-dried",
        certifications: ["usda-organic"],
        shelfLife: { duration: 18, unit: "months" },
        isFeatured: true,
        isBestSeller: true,
        tags: ["mango", "fruit", "organic", "tropical"],
      },
      {
        name: "Mixed Vegetable Chips",
        description:
          "A colorful mix of vacuum-dried vegetable chips including sweet potato, beetroot, carrot, and zucchini. Lightly seasoned with sea salt.",
        shortDescription: "Crunchy mixed vegetable chips",
        category: categories[1]._id,
        brand: "DehydratedFoods",
        images: [
          {
            url: "https://images.unsplash.com/photo-1621447504864-d8686e12698c?w=800",
            isPrimary: true,
            alt: "Mixed vegetable chips",
          },
        ],
        variants: [
          {
            size: "Snack Pack",
            weight: 40,
            weightUnit: "g",
            price: 6.99,
            sku: "VEG-MIX-40",
            stock: 150,
            isAvailable: true,
          },
          {
            size: "Family Size",
            weight: 120,
            weightUnit: "g",
            price: 16.99,
            sku: "VEG-MIX-120",
            stock: 100,
            isAvailable: true,
          },
        ],
        basePrice: 6.99,
        nutrition: {
          servingSize: "30g",
          calories: 120,
          totalFat: 5,
          sodium: 120,
          totalCarbohydrates: 18,
          dietaryFiber: 4,
          sugars: 6,
          protein: 2,
        },
        ingredients: [
          "Sweet Potato",
          "Beetroot",
          "Carrot",
          "Zucchini",
          "Sea Salt",
          "Olive Oil",
        ],
        dietaryInfo: ["vegan", "gluten-free"],
        processingMethod: "vacuum-dried",
        shelfLife: { duration: 12, unit: "months" },
        isFeatured: true,
        tags: ["vegetables", "chips", "snack", "healthy"],
      },
      {
        name: "Italian Herb Blend",
        description:
          "Classic Mediterranean blend of sun-dried basil, oregano, thyme, rosemary, and marjoram. Perfect for pasta, pizza, and roasted dishes.",
        shortDescription: "Classic Italian herb seasoning blend",
        category: categories[2]._id,
        brand: "DehydratedFoods",
        images: [
          {
            url: "https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=800",
            isPrimary: true,
            alt: "Italian herb blend",
          },
        ],
        variants: [
          {
            size: "Jar",
            weight: 30,
            weightUnit: "g",
            price: 8.99,
            sku: "HRB-ITL-30",
            stock: 200,
            isAvailable: true,
          },
          {
            size: "Refill Pack",
            weight: 60,
            weightUnit: "g",
            price: 14.99,
            sku: "HRB-ITL-60",
            stock: 120,
            isAvailable: true,
          },
        ],
        basePrice: 8.99,
        ingredients: ["Basil", "Oregano", "Thyme", "Rosemary", "Marjoram"],
        dietaryInfo: ["vegan", "gluten-free", "organic"],
        processingMethod: "sun-dried",
        certifications: ["usda-organic"],
        shelfLife: { duration: 24, unit: "months" },
        tags: ["herbs", "italian", "seasoning", "cooking"],
      },
      {
        name: "Original Beef Jerky",
        description:
          "Traditional recipe beef jerky made from premium cuts. Slow-dried for maximum flavor and tenderness. High protein, low fat snack.",
        shortDescription: "Classic slow-dried beef jerky",
        category: categories[3]._id,
        brand: "DehydratedFoods",
        images: [
          {
            url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800",
            isPrimary: true,
            alt: "Beef jerky",
          },
        ],
        variants: [
          {
            size: "Single",
            weight: 50,
            weightUnit: "g",
            price: 9.99,
            sku: "JRK-BEF-50",
            stock: 100,
            isAvailable: true,
          },
          {
            size: "Pack of 3",
            weight: 150,
            weightUnit: "g",
            price: 26.99,
            sku: "JRK-BEF-150",
            stock: 50,
            isAvailable: true,
          },
        ],
        basePrice: 9.99,
        nutrition: {
          servingSize: "30g",
          calories: 90,
          totalFat: 2,
          sodium: 450,
          totalCarbohydrates: 3,
          protein: 15,
        },
        ingredients: [
          "Beef",
          "Soy Sauce",
          "Brown Sugar",
          "Black Pepper",
          "Garlic",
        ],
        allergens: ["soy"],
        processingMethod: "air-dried",
        shelfLife: { duration: 12, unit: "months" },
        isBestSeller: true,
        tags: ["jerky", "beef", "protein", "snack"],
      },
      {
        name: "Adventure Trail Mix",
        description:
          "Energy-packed blend of freeze-dried fruits, nuts, seeds, and dark chocolate chips. Perfect for hiking, camping, or everyday snacking.",
        shortDescription: "Energizing trail mix with freeze-dried fruits",
        category: categories[4]._id,
        brand: "DehydratedFoods",
        images: [
          {
            url: "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=800",
            isPrimary: true,
            alt: "Trail mix",
          },
        ],
        variants: [
          {
            size: "Pouch",
            weight: 100,
            weightUnit: "g",
            price: 11.99,
            sku: "TRL-ADV-100",
            stock: 120,
            isAvailable: true,
          },
          {
            size: "Value Pack",
            weight: 250,
            weightUnit: "g",
            price: 24.99,
            sku: "TRL-ADV-250",
            stock: 80,
            isAvailable: true,
          },
        ],
        basePrice: 11.99,
        nutrition: {
          servingSize: "40g",
          calories: 180,
          totalFat: 10,
          sodium: 20,
          totalCarbohydrates: 20,
          dietaryFiber: 3,
          sugars: 12,
          protein: 5,
        },
        ingredients: [
          "Almonds",
          "Cashews",
          "Freeze-dried Strawberries",
          "Freeze-dried Blueberries",
          "Pumpkin Seeds",
          "Dark Chocolate Chips",
        ],
        allergens: ["nuts"],
        dietaryInfo: ["vegetarian", "gluten-free"],
        processingMethod: "freeze-dried",
        shelfLife: { duration: 12, unit: "months" },
        isFeatured: true,
        isNewArrival: true,
        tags: ["trail mix", "nuts", "hiking", "energy"],
      },
    ]);

    console.log("Created products");

    // Create coupons
    await Coupon.create([
      {
        code: "WELCOME10",
        description: "10% off your first order",
        discountType: "percentage",
        discountValue: 10,
        minimumPurchase: 25,
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        isActive: true,
        isFirstOrderOnly: true,
      },
      {
        code: "FREESHIP",
        description: "Free shipping on orders over $35",
        discountType: "fixed",
        discountValue: 5.99,
        minimumPurchase: 35,
        startDate: new Date(),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        isActive: true,
        freeShipping: true,
      },
      {
        code: "SUMMER25",
        description: "25% off summer sale",
        discountType: "percentage",
        discountValue: 25,
        maximumDiscount: 50,
        minimumPurchase: 50,
        startDate: new Date(),
        endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        isActive: true,
        usageLimit: 100,
      },
    ]);

    console.log("Created coupons");

    console.log("\n✅ Database seeded successfully!");
    console.log("\nAdmin credentials:");
    console.log("Email: admin@dehydratedfoods.com");
    console.log("Password: Admin@123");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

// Run seeder
seedDatabase();
