import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import connectMongoDB from "./config/mongodb";
import sequelize from "./config/db";

import userRoutes from "./routes/user.Routes";
import orderRoutes from "./routes/order.Routes";
import paymentRoutes from "./routes/payment.Routes";
import productItemsRoutes from "./routes/productItems.Routes";
import quizRoutes from "./routes/quiz.Routes";
import skinAnalysisRoutes from "./routes/skinAnalysis.Routes";
import warenkorbRoutes from "./routes/warenkorb.Routes";
import seedIfEmpty from "./scripts/initmongodb";

const app: Express = express();
const PORT: number = Number(process.env.PORT) || 3000;

const allowedOrigins = ["http://localhost:4200", "http://localhost:8080"];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (!allowedOrigins.includes(origin)) {
        return callback(
          new Error(`CORS policy: Origin ${origin} not allowed`),
          false
        );
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (_req: Request, res: Response) => {
  res.send("Hello, the API Skinkare is running.");
});

app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/product-items", productItemsRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/skin-analysis", skinAnalysisRoutes);
app.use("/api/warenkorb", warenkorbRoutes);

app.get("/api/test", (_req: Request, res: Response) => {
  res.json({ message: "Front-end & back-end connectés !" });
});


(async () => {
  try {
    
    await seedIfEmpty();

    connectMongoDB();

    await sequelize.sync({ alter: true });
    console.log("All tables created or updated.");

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err: any) {
    console.error("Startup error:", err);
    process.exit(1);
  }
})();