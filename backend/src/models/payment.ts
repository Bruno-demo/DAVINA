import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";
import Order from "./order";
import { StatusPayment } from "../enums/status.enum";

export interface IPaymentAttributes {
  payment_id?: number;
  order_id: number;
  amount: number;
  payment_method: string;
  status: StatusPayment;
  refund_amount?: number;
  refund_reason?: string;
  paystack_reference?: string;
  mobile_money_transaction_id?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IPaymentCreationAttributes
  extends Optional<
    IPaymentAttributes,
    "payment_id" | "createdAt" | "updatedAt" | "refund_amount" | "refund_reason" | "paystack_reference" | "mobile_money_transaction_id"
  > {}

class Payment
  extends Model<IPaymentAttributes, IPaymentCreationAttributes>
  implements IPaymentAttributes
{
  public payment_id!: number;
  public order_id!: number;
  public amount!: number;
  public payment_method!: string;
  public status!: StatusPayment;
  public refund_amount!: number;
  public refund_reason!: string;
  public paystack_reference!: string;
  public mobile_money_transaction_id!: string;

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
    payment_method: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'cash_on_delivery',
      validate: {
        isIn: [['cash_on_delivery', 'paystack', 'bank_transfer', 'momo', 'airtel']],
      },
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: StatusPayment.PENDING,
      validate: {
        isIn: [Object.values(StatusPayment)],
      },
    },
    refund_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: null,
    },
    refund_reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    paystack_reference: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    mobile_money_transaction_id: {
      type: DataTypes.STRING,
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
    tableName: "payments",
    modelName: "Payment",
    timestamps: true,
  }
);

Payment.belongsTo(Order, { foreignKey: "order_id" });

export default Payment;
