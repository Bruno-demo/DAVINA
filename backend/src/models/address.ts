import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";
import User from "./user";

export interface IAddressAttributes {
  address_id?: number;
  user_id: number;
  label: string;
  first_name: string;
  last_name: string;
  street: string;
  city: string;
  postal_code: string;
  country: string;
  phone?: string;
  is_default: boolean;
}

export interface IAddressCreationAttributes
  extends Optional<IAddressAttributes, "address_id" | "is_default" | "phone"> {}

class Address
  extends Model<IAddressAttributes, IAddressCreationAttributes>
  implements IAddressAttributes
{
  public address_id!: number;
  public user_id!: number;
  public label!: string;
  public first_name!: string;
  public last_name!: string;
  public street!: string;
  public city!: string;
  public postal_code!: string;
  public country!: string;
  public phone!: string;
  public is_default!: boolean;
}

Address.init(
  {
    address_id: {
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
    label: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "Home",
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    street: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    postal_code: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "Germany",
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    is_default: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: "addresses",
    modelName: "Address",
    timestamps: true,
  }
);

Address.belongsTo(User, { foreignKey: "user_id" });

export default Address;
