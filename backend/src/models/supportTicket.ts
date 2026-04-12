import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";

class SupportTicket extends Model {
  declare ticket_id: number;
  declare user_id: number;
  declare subject: string;
  declare message: string;
  declare status: string;
  declare priority: string;
  declare admin_reply: string | null;
  declare createdAt: Date;
  declare updatedAt: Date;
}

SupportTicket.init(
  {
    ticket_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: true },
    email: { type: DataTypes.STRING, allowNull: false },
    subject: { type: DataTypes.STRING(255), allowNull: false },
    message: { type: DataTypes.TEXT, allowNull: false },
    status: { type: DataTypes.STRING, defaultValue: "open", allowNull: false },
    priority: { type: DataTypes.STRING, defaultValue: "normal", allowNull: false },
    admin_reply: { type: DataTypes.TEXT, allowNull: true },
  },
  {
    sequelize,
    tableName: "support_tickets",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default SupportTicket;
