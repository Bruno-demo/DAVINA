import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";
import User from "./user";
import { StatusOrder } from "../enums/status.enum";

export interface IOrderAttributes {
  order_id?: number;
  user_id: number;
  ordered_items: any[];
  total_price: number;
  status: StatusOrder;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IOrderCreationAttributes
  extends Optional<IOrderAttributes, "order_id" | "createdAt" | "updatedAt"> {}

class Order
  extends Model<IOrderAttributes, IOrderCreationAttributes>
  implements IOrderAttributes
{
  public order_id!: number;
  public user_id!: number;
  public ordered_items!: any[];
  public total_price!: number;
  public status!: StatusOrder;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Order.init(
  {
    order_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "u_id",
      },
    },
    ordered_items: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    total_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: StatusOrder.PENDING,
      validate: {
        isIn: [Object.values(StatusOrder)],
      },
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
    },
  },
  {
    sequelize,
    tableName: "orders",
    modelName: "Order",
    timestamps: true,
  }
);

export default Order;
