import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import logger from "../utils/logger";

dotenv.config();

const dbName = process.env.SQL_DB as string;
const dbUser = process.env.SQL_USER as string;
const dbPassword = process.env.SQL_PASSWORD as string;
const dbHost = process.env.SQL_HOST as string;
const dbPort = parseInt(process.env.SQL_PORT as string, 10);
const isProd = process.env.NODE_ENV === "production";

const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  port: dbPort,
  dialect: "postgres",
  define: {
    timestamps: true,
    underscored: true,
  },
  pool: {
    min: 2,
    max: 10,
    acquire: 30000,
    idle: 10000,
  },
  logging: process.env.NODE_ENV === "test" ? false : isProd ? false : (msg: string) => logger.debug(msg),
  retry: {
    max: 3,
  },
});

if (process.env.NODE_ENV !== "test") {
  sequelize
    .authenticate()
    .then(() => {
      logger.info("Connection to DB has been established successfully!");
    })
    .catch((err: unknown) => {
      logger.error("Unable to connect to the database", { error: err });
    });
}

export default sequelize;
