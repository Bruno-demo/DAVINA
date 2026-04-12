import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";
import { Roles } from "../enums/role.enum";

export interface IUserAttributes {
  u_id?: number;
  u_name: string;
  u_email: string;
  u_password: string;
  u_role: Roles;
  u_phone?: string;
  newsletter_subscribed: boolean;
  is_verified: boolean;
  verification_token?: string | null;
  verification_expires?: Date | null;
  reset_token?: string | null;
  reset_token_expires?: Date | null;
}

export interface IUserCreationAttributes
  extends Optional<IUserAttributes, "u_id" | "u_phone" | "newsletter_subscribed" | "is_verified" | "verification_token" | "verification_expires" | "reset_token" | "reset_token_expires"> {}

class User
  extends Model<IUserAttributes, IUserCreationAttributes>
  implements IUserAttributes
{
  public u_id!: number;
  public u_name!: string;
  public u_email!: string;
  public u_password!: string;
  public u_role!: Roles;
  public u_phone!: string;
  public newsletter_subscribed!: boolean;
  public is_verified!: boolean;
  public verification_token!: string | null;
  public verification_expires!: Date | null;
  public reset_token!: string | null;
  public reset_token_expires!: Date | null;
}

User.init(
  {
    u_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    u_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    u_email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    u_password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    u_role: {
      type: DataTypes.ENUM(...Object.values(Roles)),
      allowNull: false,
    },
    u_phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    newsletter_subscribed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    verification_token: {
      type: DataTypes.STRING(256),
      allowNull: true,
    },
    verification_expires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    reset_token: {
      type: DataTypes.STRING(256),
      allowNull: true,
    },
    reset_token_expires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "users",
    timestamps: false,
    modelName: "User",
  }
);

export default User;
