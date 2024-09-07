import { IUserRepository } from "./IUserRepository.js";
import { IPasswordHasher } from "../../services/index.js";
import { IJwtHandler } from "../../services/jwtHandler.js";
import { INewUser } from "./index.js";
// ** Error Thrown are custom errors imported from app-errors.js ** //
import {
  EmailAlreadyInUse,
  ErrorCreatingUser,
  ErrorGeneratingToken,
  ErrorRefreshingToken,
  ErrorVerifyingToken,
  InvalidPasswordError,
  LoginError,
  PasswordValidationError,
  UnauthorizedError,
  UserWithIdNotFoundError,
} from "../utils/app-errors.js";

// ** Register User Use Case ** //
export class RegisterUserUseCase {
  constructor(
    private userRepository: IUserRepository,
    private passwordHasher: IPasswordHasher,
    private jwtHandler: IJwtHandler
  ) {}

  // ** Register User Use Case Method ** //
  async RegisterUser(
    user: INewUser
  ): Promise<{ user: INewUser; token: string }> {
    try {
      // ** Check if Email already exists ** //
      const userExists = await this.userRepository.findUserByEmail(user.email);
      if (userExists) {
        throw new EmailAlreadyInUse(); // Customized error message
      }

      // ** Validate Password ** //
      this.passwordHasher.validatePassword(user.password);

      // ** Hash Password ** //
      const hashedPassword = await this.passwordHasher.hashPassword(
        user.password
      );

      if (!hashedPassword) {
        throw new PasswordValidationError(); // Customized error message
      }

      // ** Create User ** //
      const newUser = await this.userRepository.createUser({
        ...user,
        password: hashedPassword,
      });
      if (!newUser) {
        throw new ErrorCreatingUser();
      }

      // ** Generate Token ** //
      const token = this.jwtHandler.jwtGenerator({
        id: newUser.id as number,
        role: "user",
      });
      if (!token) {
        throw new ErrorGeneratingToken();
      }

      // ** Return User and Token ** //
      return { user: newUser, token };
    } catch (error) {
      // ** Log and handle different types of errors ** //
      if (
        error instanceof EmailAlreadyInUse ||
        error instanceof PasswordValidationError
      ) {
        console.error("Validation error during registration:", error.message);
        throw error; // ** Rethrow to be handled by the upper layers ** //
      }

      if (
        error instanceof ErrorCreatingUser ||
        error instanceof ErrorGeneratingToken
      ) {
        console.error(
          "User creation or token generation error:",
          error.message
        );
        throw error; // ** Rethrow to be handled by the upper layers ** //
      }

      // ** Fallback for unexpected errors ** //
      console.error("Unexpected error during user registration:", error);
      throw new Error("An unexpected error occurred during user registration.");
    }
  }
}

// ** Login User Use Case ** //
export class LoginUserUseCase {
  constructor(
    private userRepository: IUserRepository,
    private jwtHandler: IJwtHandler,
    private passwordHasher: IPasswordHasher
  ) {}

  // ** Login User Use Case Method ** //
  async LoginUser(
    email: string,
    password: string
  ): Promise<{
    user: INewUser;
    token: string;
    refreshToken: string;
  }> {
    try {
      // ** Find User by Email ** //
      const user = await this.userRepository.findUserByEmail(email);
      if (!user) {
        throw new LoginError();
      }

      // ** Compare Password ** //
      const comparePassword = await this.passwordHasher.comparePassword(
        password,
        user.password
      );
      if (!comparePassword) {
        throw new InvalidPasswordError();
      }

      // ** Generate Token ** //
      const token = this.jwtHandler.jwtGenerator({
        id: user.id as number,
        role: "user",
      });
      if (!token) {
        throw new ErrorGeneratingToken();
      }

      // ** Generate Refresh Token ** //
      const refreshToken = this.jwtHandler.jwtRefreshGenerator({
        id: user.id as number,
        role: "user",
      });
      if (!refreshToken) {
        throw new ErrorRefreshingToken();
      }

      // ** Return User, Token and Refresh Token ** //
      return { user, token, refreshToken };
    } catch (error) {
      // ** Handle and log the error based on its type ** //
      if (
        error instanceof LoginError ||
        error instanceof InvalidPasswordError
      ) {
        console.error("Authentication error:", error.message);
        throw error; // ** Rethrow to be handled by upper layers ** //
      }

      if (
        error instanceof ErrorGeneratingToken ||
        error instanceof ErrorRefreshingToken
      ) {
        console.error("Token generation error:", error.message);
        throw error; // ** Rethrow to be handled by upper layers ** //
      }
      // ** Fallback for unexpected errors ** //
      console.error("Unexpected error during login:", error);
      throw new Error("An unexpected error occurred during login.");
    }
  }
}

// ** RefreshToken Use Case ** //
export class RefreshTokenUseCase {
  constructor(
    private userRepository: IUserRepository,
    private jwtHandler: IJwtHandler
  ) {}

  // ** Refresh Token Use Case Method ** //
  async RefreshToken(
    id: string,
    role: string
  ): Promise<{
    id: string;
    role: string;
  }> {
    try {
      // ** Decode Token ** //
      const decodedToken = this.jwtHandler.jwtVerifier(id);
      if (!decodedToken) {
        throw new ErrorVerifyingToken();
      }

      // ** Find User by ID ** //
      const user = await this.userRepository.findUsersById(
        decodedToken.id as number
      );
      if (!user) {
        throw new UserWithIdNotFoundError();
      }

      // ** Generate refresh Token ** //
      const token = this.jwtHandler.jwtRefreshGenerator({
        id: user.id as number,
        role: role,
      });
      if (!token) {
        throw new ErrorGeneratingToken();
      }
      return { id, role };
    } catch (error) {
      // **  Log and handle specific errors ** //
      if (
        error instanceof ErrorVerifyingToken ||
        error instanceof UserWithIdNotFoundError
      ) {
        console.error(
          "Token verification or user lookup error:",
          error.message
        );
        throw error; // ** Rethrow specific errors for upper layers to handle ** //
      }

      if (error instanceof ErrorGeneratingToken) {
        console.error("Token generation error:", error.message);
        throw error; // ** Rethrow specific errors for upper layers to handle ** //
      }
      // ** Fallback for unexpected errors ** //
      console.error("Unexpected error during token refresh:", error);
      throw new Error("An unexpected error occurred during token refresh.");
    }
  }
}

// ** Logout user uses case ** //
export class LogoutUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async LogoutUser(email: string): Promise<INewUser> {
    try {
      const user = await this.userRepository.findUserByEmail(email);
      if (!user) {
        throw new Error("User not found");
      }

      await this.userRepository.logoutUser(email);
      return user;
    } catch (error) {
      // ** Log and handle different types of errors ** //
      console.error("Error logging out user:", error);
      throw new Error("An unexpected error occurred during user logout.");
    }
  }
}

// ** Verify User Use Case with id, role and token ** //
export class VerifyUserUseCase {
  constructor(
    private userRepository: IUserRepository,
    private jwtHandler: IJwtHandler
  ) {}
  async VerifyUser(token: string): Promise<void> {
    try {
      // ** Decode Token ** //
      const decodedToken = this.jwtHandler.jwtVerifier(token);
      if (!decodedToken) {
        throw new ErrorVerifyingToken();
      }
      console.log("Decoded Token", decodedToken);
      // ** Retrieve User ID and Role From Token ** //
      const user_id = decodedToken.id as number;
      if (!user_id) {
        throw new UnauthorizedError();
      }
      console.log("User ID", user_id);
      // ** Retrieve User Role From Token ** //
      const user_role = decodedToken.role;
      if (!user_role) {
        throw new UnauthorizedError();
      }

      console.log("Role", user_role);

      // ** Find User with the id retrieved from the token ** //
      const user = await this.userRepository.findUsersById(user_id);
      if (!user) {
        throw new UnauthorizedError();
      }
      console.log("User", user);
      // ** Return User ** //
      return;
    } catch (error) {
      // ** Handle and log specific errors ** //
      if (
        error instanceof ErrorVerifyingToken ||
        error instanceof UnauthorizedError
      ) {
        console.error("Authorization error:", error.message);
        throw error; // ** Rethrow specific errors to be handled by the caller ** //
      }
      // ** Fallback for unexpected errors ** //
      console.error("Unexpected error during user verification:", error);
      throw new Error("An unexpected error occurred during user verification.");
    }
  }
}

export default {
  RegisterUserUseCase,
  LoginUserUseCase,
  RefreshTokenUseCase,
  LogoutUserUseCase,
  VerifyUserUseCase,
};
