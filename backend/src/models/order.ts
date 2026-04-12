import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";
import User from "./user";
import { StatusOrder, ShippingMethod } from "../enums/status.enum";

export interface IOrderAttributes {
  order_id?: number;
  user_id: number;
  ordered_items: any[];
  total_price: number;
  status: StatusOrder;
  shipping_method: ShippingMethod;
  shipping_cost: number;
  tax_amount: number;
  order_notes?: string;
  tracking_number?: string;
  coupon_code?: string;
  discount_amount: number;
  shipping_address_id?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IOrderCreationAttributes
  extends Optional<IOrderAttributes, "order_id" | "createdAt" | "updatedAt" | "shipping_method" | "shipping_cost" | "tax_amount" | "discount_amount" | "order_notes" | "tracking_number" | "coupon_code" | "shipping_address_id"> {}

class Order
  extends Model<IOrderAttributes, IOrderCreationAttributes>
  implements IOrderAttributes
{
  public order_id!: number;
  public user_id!: number;
  public ordered_items!: any[];
  public total_price!: number;
  public status!: StatusOrder;
  public shipping_method!: ShippingMethod;
  public shipping_cost!: number;
  public tax_amount!: number;
  public order_notes!: string;
  public tracking_number!: string;
  public coupon_code!: string;
  public discount_amount!: number;
  public shipping_address_id!: number;

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
    shipping_method: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: ShippingMethod.STANDARD,
    },
    shipping_cost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 4.99,
    },
    tax_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    order_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    tracking_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    coupon_code: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    discount_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    shipping_address_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
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
