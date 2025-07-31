import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";
import Order from "./order";
import { StatusPayment } from "../enums/status.enum";

export interface IPaymentAttributes {
  payment_id?: number;
  order_id: number;
  amount: number;
  status: StatusPayment;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IPaymentCreationAttributes
  extends Optional<
    IPaymentAttributes,
    "payment_id" | "createdAt" | "updatedAt"
  > {}

class Payment
  extends Model<IPaymentAttributes, IPaymentCreationAttributes>
  implements IPaymentAttributes
{
  public payment_id!: number;
  public order_id!: number;
  public amount!: number;
  public status!: StatusPayment;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Payment.init(
  {
    payment_id: {
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
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: StatusPayment.AUSSTEHEND,
      validate: {
        isIn: [Object.values(StatusPayment)],
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
    tableName: "payments",
    modelName: "Payment",
    timestamps: true,
  }
);

Payment.belongsTo(Order, { foreignKey: "order_id" });

export default Payment;
