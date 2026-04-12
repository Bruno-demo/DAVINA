import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";
import User from "./user";
import Order from "./order";
import { StatusReturn } from "../enums/status.enum";

export interface IReturnRequestAttributes {
  return_id?: number;
  order_id: number;
  user_id: number;
  reason: string;
  status: StatusReturn;
  admin_notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IReturnRequestCreationAttributes
  extends Optional<IReturnRequestAttributes, "return_id" | "createdAt" | "updatedAt" | "admin_notes"> {}

class ReturnRequest
  extends Model<IReturnRequestAttributes, IReturnRequestCreationAttributes>
  implements IReturnRequestAttributes
{
  public return_id!: number;
  public order_id!: number;
  public user_id!: number;
  public reason!: string;
  public status!: StatusReturn;
  public admin_notes!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ReturnRequest.init(
  {
    return_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    order_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Order,
        key: "order_id",
      },
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "u_id",
      },
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: StatusReturn.PENDING,
      validate: {
        isIn: [Object.values(StatusReturn)],
      },
    },
    admin_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
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
    tableName: "return_requests",
    modelName: "ReturnRequest",
    timestamps: true,
  }
);

ReturnRequest.belongsTo(Order, { foreignKey: "order_id" });
ReturnRequest.belongsTo(User, { foreignKey: "user_id" });

export default ReturnRequest;
