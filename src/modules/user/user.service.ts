import { Secret } from "jsonwebtoken";
import ApiError from "../../middleware/error";
import { HashPassword } from "../../shared/hashPassword";
import JwtHelpers from "../../shared/jsonWebTokenHelpers";
import { IUser } from "./user.interface";
import User from "./user.model";

class Service {
  async registerUser(payload: IUser) {
    const { email } = payload;
    const isExistUser = await User.findOne({ email });

    if (isExistUser) {
      throw new ApiError(409, "User Email already in use");
    }

    const hashedPassword = await HashPassword.hash(payload?.password);
    payload.password = hashedPassword;

    const user = new User(payload);
    await user.save();
    return true;
  }

  async loginUser(payload: { email: string; password: string }) {
    const isUserExist: any = await User.findOne({
      email: payload?.email,
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
      { email: payload.email },
      {
        password: 0,
      }
    );

    const token = JwtHelpers.createToken(
      {
        id: userData.id,
        name: userData.name,
        email: userData.email,
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
}

export const UserService = new Service();
