import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";
import { Roles } from "../enums/role.enum";

export interface IUserAttributes {
  u_id?: number;
  u_name: string;
  u_email: string;
  u_password: string;
  u_role: Roles;
}

export interface IUserCreationAttributes
  extends Optional<IUserAttributes, "u_id"> {}

class User
  extends Model<IUserAttributes, IUserCreationAttributes>
  implements IUserAttributes
{
  public u_id!: number;
  public u_name!: string;
  public u_email!: string;
  public u_password!: string;
  public u_role!: Roles;
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
  },
  {
    sequelize,
    tableName: "users",
    timestamps: false,
    modelName: "User",
  }
);

export default User;
