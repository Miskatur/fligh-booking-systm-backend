import { Secret } from "jsonwebtoken";
import ApiError from "../../middleware/error";
import { HashPassword } from "../../shared/hashPassword";
import JwtHelpers from "../../shared/jsonWebTokenHelpers";
import { IUser } from "./user.interface";
import User from "./user.model";

class Service {
  async registerUser(payload: IUser) {
    const { username } = payload;
    const isExistUser = await User.findOne({ username });

    if (isExistUser) {
      throw new ApiError(409, "Username already in use");
    }

    const hashedPassword = await HashPassword.hash(payload?.password);
    payload.password = hashedPassword;

    const user = new User(payload);
    await user.save();
    return user;
  }

  async loginUser(payload: { username: string; password: string }) {
    const isUserExist: any = await User.findOne({
      username: payload?.username,
    });
    if (!isUserExist) {
      throw new ApiError(404, "User not found");
    }
    const isPasswordCorrect = await HashPassword.compare(
      payload?.password,
      isUserExist?.password
    );
    if (!isPasswordCorrect) {
      throw new ApiError(403, "Password is incorrect");
    }

    const userData: any = await User.findOne(
      { username: payload.username },
      {
        password: 0,
      }
    );

    const token = JwtHelpers.createToken(
      {
        id: userData.id,
        name: userData.name,
        username: userData.username,
        role: userData.role,
      },
      process.env.JWT_ACCESS_TOKEN_SECRET as Secret,
      "1yr"
    );
    return {
      userData,
      accessToken: token,
    };
  }

  async getAllUsers() {
    const users = await User.find({
      role: { $ne: "ADMIN" },
    }).sort({ createdAt: -1 });
    return users;
  }

  async deleteUser(id: string) {
    const isUserExist = await User.findById(id);

    if (!isUserExist) {
      throw new ApiError(404, "User not found");
    }

    const result = await User.findByIdAndDelete(id).select({ id: 1 });

    return result;
  }
}

export const UserService = new Service();
