import { DataTypes, Model, Optional } from "sequelize";
import { sequelizeConInstance } from "../../sequelizeCon.js";
import follows from "./follow.model.js";

interface UserAttributes {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  reset_password_token: string;
  reset_password_expires: Date;
  status: string;
  bio: string;
  joined_date: Date;
  last_login: Date;
  last_logout: Date;
  last_activity: Date;
  role: string;
  avatarUrl: string;
  profile_picture: string;
  user_registration_id: number;
  created_at: Date;
  updated_at: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, "id"> {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  bio: string;
  joined_date: Date;
  last_login: Date;
  last_logout: Date;
  last_activity: Date;
  role: string;
  avatarUrl: string;
  profile_picture: string;
  user_registration_id: number;
  created_at: Date;
  updated_at: Date;
}

const sequelize = sequelizeConInstance();

class users
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  declare id: number;
  declare firstName: string;
  declare lastName: string;
  declare username: string;
  declare email: string;
  declare password: string;
  declare reset_password_token: string;
  declare reset_password_expires: Date;
  declare status: string;
  declare bio: string;
  declare joined_date: Date;
  declare last_login: Date;
  declare last_logout: Date;
  declare last_activity: Date;
  declare followers: number;
  declare following: number;
  declare role: string;
  declare avatarUrl: string;
  declare profile_picture: string;
  declare user_registration_id: number;
  declare created_at: Date;
  declare updated_at: Date;

  static async generateAvatarUrl(
    firstName: string,
    lastName: string,
  ): Promise<string> {
    const name = `${firstName} ${lastName}`;
    const initials = name
      .split(" ")
      .map((n) => n[0])
      .join("");
    return `https://ui-avatars.com/api/?name=${initials}&background=random&color=fff`;
  }

  // ** Static method to get the user by id ** //
  static async getUserById(id: number): Promise<users | null> {
    return users.findByPk(id);
  }
}

users.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isUnique: async (value: string) => {
          const user = await users.findOne({ where: { username: value } });
          if (user) {
            throw new Error("Username already in use");
          }
        },
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
        isUnique: async (value: string) => {
          const user = await users.findOne({ where: { email: value } });
          if (user) {
            throw new Error("Email already in use");
          }
        },
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    reset_password_token: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    reset_password_expires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "active",
    },
    bio: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "Write something about yourself",
    },
    joined_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    last_logout: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    last_activity: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "user",
    },
    avatarUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    profile_picture: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    user_registration_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "UserRegistration",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: "users",
    freezeTableName: true,
    timestamps: false,
  },
);

// User associations
users.belongsToMany(users, {
  through: follows,
  as: "Followers",
  foreignKey: "follower_id",
});

users.belongsToMany(users, {
  through: follows,
  as: "Following",
  foreignKey: "following_id",
});

await sequelize
  .sync({ alter: false })
  .then(() => {
    console.log("User table created successfully");
  })
  .catch((err: Error) => {
    console.error("Error creating User table:", err);
  });

export default users;
