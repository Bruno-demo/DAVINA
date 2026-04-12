import dotenv from "dotenv";
import mongoose from "mongoose";
import ProductItem, { IProductItem } from "../models/productItems";
dotenv.config();

type ProductSeedInput = Pick<
  IProductItem,
  | "p_name"
  | "p_description"
  | "skin_typ_target"
  | "effect"
  | "price"
  | "image_url"
  | "category"
>;

const products: ProductSeedInput[] = [
  {
    p_name: "Hydrating Face Cream",
    p_description: "Deeply hydrates dry skin.",
    skin_typ_target: "dry",
    effect: "Hydration",
    price: 19.99,
    category: "Skincare",
    image_url:
      "https://cdn.shopify.com/s/files/1/0274/9503/9079/files/hydrating_face_cream.jpg?v=1723650067",
  },
  {
    p_name: "Daily UV Protect Set",
    p_description: "Maximum everyday protection against free radicals.",
    skin_typ_target: "oily",
    effect: "Mattifying",
    price: 44.9,
    category: "Skincare",
    image_url: "https://ibb.co/KtgypxX",
  },
  {
    p_name: "Purifying Gel Cleanser",
    p_description: "Visibly reduces the appearance of wrinkles.",
    skin_typ_target: "normal",
    effect: "Anti-Aging",
    price: 28.67,
    category: "Skincare",
    image_url: "https://ibb.co/LD4XxVrM",
  },
  {
    p_name: "Double Cleansing Set",
    p_description: "Especially effective, residue-free facial cleansing.",
    skin_typ_target: "combination",
    effect: "Soothing",
    price: 35.01,
    category: "Skincare",
    image_url: "https://ibb.co/pjTv6T7v",
  },
  {
    p_name: "Niacinamide Booster",
    p_description: "Visibly refines pores and strengthens the skin barrier.",
    skin_typ_target: "combination",
    effect: "Soothing",
    price: 32.95,
    category: "Skincare",
    image_url: "https://ibb.co/Jj8GmZkz",
  },
  {
    p_name: "Calming Moisturizer",
    p_description:
      "Nourishes and soothes sensitive skin and supports hydration.",
    skin_typ_target: "combination",
    effect: "Hydration",
    price: 26.95,
    category: "Skincare",
    image_url: "https://ibb.co/SwfsmJnG",
  },
  {
    p_name: "BYOMA Hydrating Serum",
    p_description:
      "This ultra-light, nourishing face serum is enriched with hydrating ingredients.",
    skin_typ_target: "dry",
    effect: "Hydration",
    price: 26.95,
    category: "Skincare",
    image_url: "https://ibb.co/r2m2v8Gs",
  },
  {
    p_name: "LANEIGE Plumping Trio",
    p_description:
      "Discover the secret to fresh, revitalized skin with the Plump & Hydrate Trio. This exclusive set helps plump and hydrate.",
    skin_typ_target: "dry",
    effect: "Hydration",
    price: 26.95,
    category: "Skincare",
    image_url: "https://ibb.co/1tH4ttb0",
  },
  {
    p_name: "Banana Bright",
    p_description:
      "Get our bestselling vitamin C eye cream with a new and improved formula.",
    skin_typ_target: "dry",
    effect: "Hydration",
    price: 39.5,
    category: "Skincare",
    image_url: "https://ibb.co/nsD0JLdP",
  },
  {
    p_name: "INNISFREE Hyaluronic Acid",
    p_description:
      "Strengthen your skin's natural moisture barrier and boost radiance.",
    skin_typ_target: "dry",
    effect: "Hydration",
    price: 39.5,
    category: "Skincare",
    image_url: "https://ibb.co/Y7yyWB6M",
  },
  {
    p_name: "GLOW RECIPE",
    p_description:
      "A hydrating, balancing gel-cream with a rich texture in a refillable jar.",
    skin_typ_target: "dry",
    effect: "Hydration",
    price: 20.95,
    category: "Skincare",
    image_url: "https://ibb.co/cSRbDwcR",
  },

  // ── Fragrances ──
  {
    p_name: "Rose Oud Eau de Parfum",
    p_description: "A luxurious blend of Rwandan rose absolute and smoky oud wood. Long-lasting, captivating, and sophisticated.",
    skin_typ_target: "normal",
    effect: "Long-Lasting",
    price: 89.0,
    category: "Fragrances",
    image_url: "",
  },
  {
    p_name: "Citrus Blossom Body Mist",
    p_description: "Light and refreshing body mist with notes of bergamot, lemon verbena, and white tea. Perfect for everyday wear.",
    skin_typ_target: "normal",
    effect: "Refreshing",
    price: 24.95,
    category: "Fragrances",
    image_url: "",
  },
  {
    p_name: "Vanilla Amber Perfume Oil",
    p_description: "A warm, intimate roll-on perfume oil with Madagascar vanilla, amber resin, and a hint of sandalwood.",
    skin_typ_target: "dry",
    effect: "Nourishing",
    price: 34.5,
    category: "Fragrances",
    image_url: "",
  },
  {
    p_name: "African Sunset Eau de Toilette",
    p_description: "Inspired by golden Rwandan evenings. Notes of neroli, jasmine, and cedarwood create a warm, elegant scent.",
    skin_typ_target: "normal",
    effect: "Long-Lasting",
    price: 65.0,
    category: "Fragrances",
    image_url: "",
  },

  // ── Makeup ──
  {
    p_name: "Luminous Matte Foundation",
    p_description: "Buildable, full-coverage matte foundation with SPF 15. Available in 30 shades for every skin tone.",
    skin_typ_target: "oily",
    effect: "Mattifying",
    price: 32.0,
    category: "Makeup",
    image_url: "",
  },
  {
    p_name: "Velvet Lip Stain Set",
    p_description: "Set of 4 long-wearing lip stains in rich, pigmented shades. Transfer-proof and moisturizing.",
    skin_typ_target: "normal",
    effect: "Long-Lasting",
    price: 28.5,
    category: "Makeup",
    image_url: "",
  },
  {
    p_name: "Glow Bronzer Palette",
    p_description: "Sun-kissed bronzing palette with 4 shimmer and matte shades. Enriched with vitamin E for a silky finish.",
    skin_typ_target: "normal",
    effect: "Brightening",
    price: 36.0,
    category: "Makeup",
    image_url: "",
  },
  {
    p_name: "Volume & Curl Mascara",
    p_description: "Dramatic volume and lift with a smudge-proof formula. The curved brush reaches every lash from root to tip.",
    skin_typ_target: "normal",
    effect: "Volumizing",
    price: 18.95,
    category: "Makeup",
    image_url: "",
  },
  {
    p_name: "Cream Concealer Stick",
    p_description: "Creamy, blendable concealer for under-eyes and blemishes. Lightweight formula that won't crease or cake.",
    skin_typ_target: "combination",
    effect: "Brightening",
    price: 15.5,
    category: "Makeup",
    image_url: "",
  },

  // ── Accessories ──
  {
    p_name: "Jade Face Roller",
    p_description: "Authentic jade stone face roller for lymphatic drainage, reducing puffiness, and enhancing product absorption.",
    skin_typ_target: "normal",
    effect: "Soothing",
    price: 22.0,
    category: "Accessories",
    image_url: "",
  },
  {
    p_name: "Silk Pillowcase Set",
    p_description: "100% mulberry silk pillowcase that reduces friction on skin and hair. Hypoallergenic and temperature-regulating.",
    skin_typ_target: "dry",
    effect: "Nourishing",
    price: 45.0,
    category: "Accessories",
    image_url: "",
  },
  {
    p_name: "Professional Brush Set",
    p_description: "12-piece vegan makeup brush set with bamboo handles. Includes foundation, powder, contour, blending, and eye brushes.",
    skin_typ_target: "normal",
    effect: "Brightening",
    price: 49.95,
    category: "Accessories",
    image_url: "",
  },
  {
    p_name: "LED Makeup Mirror",
    p_description: "Rechargeable vanity mirror with 3 lighting modes and 10x magnification. Perfect for precise makeup application.",
    skin_typ_target: "normal",
    effect: "Brightening",
    price: 38.0,
    category: "Accessories",
    image_url: "",
  },

  // ── Hair Care ──
  {
    p_name: "Argan Oil Hair Serum",
    p_description: "Lightweight argan oil serum that tames frizz, adds shine, and protects against heat damage up to 230°C.",
    skin_typ_target: "dry",
    effect: "Nourishing",
    price: 19.95,
    category: "Hair Care",
    image_url: "",
  },
  {
    p_name: "Coconut Repair Hair Mask",
    p_description: "Deep conditioning mask with coconut oil, shea butter, and keratin. Restores damaged hair in just 10 minutes.",
    skin_typ_target: "dry",
    effect: "Hydration",
    price: 16.5,
    category: "Hair Care",
    image_url: "",
  },

  // ── Bath & Body ──
  {
    p_name: "Shea Butter Body Lotion",
    p_description: "Rich, fast-absorbing body lotion with raw shea butter and vitamin E. Leaves skin silky smooth all day.",
    skin_typ_target: "dry",
    effect: "Hydration",
    price: 18.0,
    category: "Bath & Body",
    image_url: "",
  },
  {
    p_name: "Exfoliating Coffee Body Scrub",
    p_description: "Invigorating body scrub with Rwandan coffee grounds, coconut oil, and brown sugar. Buffs away dead skin cells.",
    skin_typ_target: "normal",
    effect: "Refreshing",
    price: 22.5,
    category: "Bath & Body",
    image_url: "",
  },
  {
    p_name: "Lavender Bath Bomb Set",
    p_description: "Set of 6 handcrafted bath bombs with lavender essential oil, Epsom salts, and nourishing oils for a spa-like soak.",
    skin_typ_target: "normal",
    effect: "Soothing",
    price: 24.0,
    category: "Bath & Body",
    image_url: "",
  },
];

const seedProducts = async (): Promise<void> => {
  try {
    console.log(" Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI || "");
    console.log(" Connected to MongoDB");

    for (const product of products) {
      const exists = await ProductItem.findOne({ p_name: product.p_name });
      if (!exists) {
        await ProductItem.create(product);
        console.log(` Inserted: ${product.p_name}`);
      } else {
        console.log(` Skipped (already exists): ${product.p_name}`);
      }
    }

    console.log(" Seeding complete!");
  } catch (error) {
    console.error(" Error seeding products:", error);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
};

seedProducts();
