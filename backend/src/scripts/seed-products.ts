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
>;

const products: ProductSeedInput[] = [
  {
    p_name: "Hydrating Face Cream",
    p_description: "Hydrate intensément les peaux sèches.",
    skin_typ_target: "trocken",
    effect: "Hydratation",
    price: 19.99,
    image_url:
      "https://cdn.shopify.com/s/files/1/0274/9503/9079/files/hydrating_face_cream.jpg?v=1723650067",
  },
  {
    p_name: "Daily UV Protect Set",
    p_description: "Maximaler Schutz vor freien Radikalen für jeden Tag.",
    skin_typ_target: "fettig",
    effect: "Mattierend",
    price: 44.9,
    image_url: "https://ibb.co/KtgypxX",
  },
  {
    p_name: "Purifying Gel Cleanser",
    p_description: "Réduit visiblement les rides.",
    skin_typ_target: "normal",
    effect: "Anti-Age",
    price: 28.67,
    image_url: "https://ibb.co/LD4XxVrM",
  },
  {
    p_name: "Double Cleansing Set",
    p_description: "Besonders effektive und rückstandslose Gesichtsreinigung.",
    skin_typ_target: "misch",
    effect: "Beruhigend",
    price: 35.01,
    image_url: "https://ibb.co/pjTv6T7v",
  },
  {
    p_name: "Niacinamide Booster",
    p_description: "Verfeinert Poren sichtbar und stärkt die Hautbarriere.",
    skin_typ_target: "misch",
    effect: "Beruhigend",
    price: 32.95,
    image_url: "https://ibb.co/Jj8GmZkz",
  },
  {
    p_name: "Calming Moisturizer",
    p_description:
      "Pflegt und beruhigt empfindliche Haut, unterstützt die Feuchtigkeitsversorgung.",
    skin_typ_target: "misch",
    effect: "Hydratation",
    price: 26.95,
    image_url: "https://ibb.co/SwfsmJnG",
  },
  {
    p_name: "BYOMA Hydrating Serum",
    p_description:
      "Dieses ultraleichte, pflegende Gesichtsserum ist mit feuchtigkeitsspendenden Elementen angereichert.",
    skin_typ_target: "trocken",
    effect: "Hydratation",
    price: 26.95,
    image_url: "https://ibb.co/r2m2v8Gs",
  },
  {
    p_name: "LANEIGE Trio aufpolsternd",
    p_description:
      "Entdecke das Geheimnis frischer, revitalisierter Haut mit dem Plump & Hydrate Trio!Das exklusive Set.",
    skin_typ_target: "trocken",
    effect: "Hydratation",
    price: 26.95,
    image_url: "https://ibb.co/1tH4ttb0",
  },
  {
    p_name: "Banana Bright",
    p_description:
      "Holen Sie sich unsere Bestseller Vitamin-C-Augencreme mit einer neuen und verbesserten Formel ohne.",
    skin_typ_target: "trocken",
    effect: "Hydratation",
    price: 39.5,
    image_url: "https://ibb.co/nsD0JLdP",
  },
  {
    p_name: "INNISFREE mit Hyaluronsäure",
    p_description:
      "Stärke die natürliche Feuchtigkeitsbarriere der Haut und bringe sie zum Strahlen!",
    skin_typ_target: "trocken",
    effect: "Hydratation",
    price: 39.5,
    image_url: "https://ibb.co/Y7yyWB6M",
  },
  {
    p_name: "GLOW RECIPE",
    p_description:
      "Eine feuchtigkeitsspendende, ausgleichende Gel-Creme mit üppiger Textur in einem nachfüllbaren Tiegel.",
    skin_typ_target: "trocken",
    effect: "Hydratation",
    price: 20.95,
    image_url: "https://ibb.co/cSRbDwcR",
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
