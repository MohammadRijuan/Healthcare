import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import {
  IGoogleLoginPayload,
  IloginUserPayload,
  IRegisterPatientPayload,
  IRequestUser,
} from "./auth.interface";
import {
  AuthProvider,
  Role,
  UserStatus,
} from "../../../generated/prisma/enums";
import { jwtUtils } from "../../utils/jwt";
import config from "../../config";
import { JwtPayload, SignOptions } from "jsonwebtoken";
import { TokenPayload } from "google-auth-library";
import { googleClient } from "../../lib/googleAuth";

const registerUserService = async (payload: IRegisterPatientPayload) => {
  const { name, password } = payload;

  const email = payload.email.trim().toLowerCase();

  const isUserExist = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (isUserExist) {
    throw new Error("User with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 8);

  const createUser = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: Role.PATIENT,
      status: UserStatus.ACTIVE,
      emailVerified: false,
      patient: {
        create: {
          name,
          email,
        },
      },
    },
    omit: {
      password: true,
    },
    include: {
      patient: true,
    },
  });

  const { patient, ...user } = createUser;

  const jwtPayload = {
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_access_secret,
    config.jwt_access_expires_in as SignOptions,
  );

  const refreshToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_refresh_secret,
    config.jwt_refresh_expires_in as SignOptions,
  );

  return {
    user,
    patient,
    accessToken,
    refreshToken,
  };
};

const loginUserService = async (payload: IloginUserPayload) => {
  const { password } = payload;
  const email = payload.email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (user.status === UserStatus.BLOCKED) {
    throw new Error("User is blocked");
  }

  if (user.isDeleted || user.status === UserStatus.DELETED) {
    throw new Error("User is deleted");
  }

  if (user.password === null && user.googleId !== null) {
    throw new Error(
      "User Already Has Account Registered With Google. Try To Login With Google.",
    );
  }

  const isPasswordMatched = await bcrypt.compare(
    password,
    user.password as string,
  );

  if (!isPasswordMatched) {
    throw new Error("Invalid credentials");
  }

  const jwtPayload = {
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_access_secret,
    config.jwt_access_expires_in as SignOptions,
  );

  const refreshToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_refresh_secret,
    config.jwt_refresh_expires_in as SignOptions,
  );

  return {
    accessToken,
    refreshToken,
  };
};
const getMyProfileService = async (user: IRequestUser) => {
  const isUserExist = await prisma.user.findUnique({
    where: {
      id: user.userId,
    },
    include: {
      patient: true,
    },
    omit: {
      password: true,
    },
  });

  if (!isUserExist) {
    throw new Error("user not found");
  }

  return isUserExist;
};

const refreshTokenService = async (token: string) => {
  const verifiedRefreshToken = jwtUtils.verifyToken(
    token,
    config.jwt_refresh_secret,
  );

  if (!verifiedRefreshToken.success || !verifiedRefreshToken.data) {
    throw new Error(
      config.node_env === "development"
        ? verifiedRefreshToken.error
        : "Invalid refresh token",
    );
  }

  const data = verifiedRefreshToken.data as JwtPayload;

  const user = await prisma.user.findUnique({
    where: {
      id: data?.id,
    },
  });

  if (!user || user.isDeleted || user.status !== UserStatus.ACTIVE) {
    throw new Error("User is inactive or not found");
  }

  const jwtPayload = {
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_access_secret,
    config.jwt_access_expires_in as SignOptions,
  );

  const refreshToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_refresh_secret,
    config.jwt_refresh_expires_in as SignOptions,
  );

  return {
    accessToken,
    refreshToken,
  };
};

const googleLoginService = async (payload: IGoogleLoginPayload) => {
  // Store the decoded Google ID token payload.
  // It will contain information such as Google's user ID, email and name.
  let googleIdTokenPayload: TokenPayload | null | undefined = null;

  // Verify the Google ID token to ensure it was genuinely issued by Google.
  // The audience must match our application's Google Client ID.
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: payload.idToken,
      audience: config.google_client_id, //client id
    });

    // Extract the user's information from the verified Google token.
    googleIdTokenPayload = ticket.getPayload();
  } catch (error) {
    // If verification fails, the token may be invalid, expired or incorrectly signed.
    console.log("Google Id Token verification failed", error);

    throw new Error("Invalid or Expired Google id token");
  }

  // Make sure Google returned a valid payload before accessing its properties.
  if (!googleIdTokenPayload) {
    throw new Error("Invalid or Expired Google Id Token");
  }

  // Email is required to identify the user in our database.
  if (!googleIdTokenPayload.email) {
    throw new Error("Google Email not Found");
  }

  // Name is required when creating a new patient account.
  if (!googleIdTokenPayload.name) {
    throw new Error("Google Email User Name Not Found");
  }

  // Check whether a patient already exists with this Google ID and email.
  // This handles users who have previously logged in using Google.
  const ifPatientExistWithGoogleAuth = await prisma.user.findUnique({
    where: {
      email: googleIdTokenPayload.email,
      role: Role.PATIENT,
      googleId: googleIdTokenPayload.sub,
    },
  });

  // If an existing Google-authenticated patient is found,
  // use that user instead of creating a new account.
  let user = ifPatientExistWithGoogleAuth;

  // If no Google-authenticated account exists, check whether
  // the same email is already registered using email and password.
  if (!ifPatientExistWithGoogleAuth) {
    const ifPatientExistWithCredentials = await prisma.user.findUnique({
      where: {
        email: googleIdTokenPayload.email,
        role: Role.PATIENT,
        authProvider: AuthProvider.CREDENTIAL,
      },
    });

    // If a credential-based account exists, link the Google account
    // to that existing account instead of creating a duplicate.
    if (ifPatientExistWithCredentials) {
      // Only verified email accounts can be linked with Google.
      if (!ifPatientExistWithCredentials.emailVerified) {
        throw new Error("Email not verified");
      }

      // Prevent blocked users from logging in through Google.
      if (ifPatientExistWithCredentials.status === UserStatus.BLOCKED) {
        throw new Error("User Is Blocked");
      }

      // Prevent deleted accounts from being linked or accessed.
      if (
        ifPatientExistWithCredentials.isDeleted ||
        ifPatientExistWithCredentials.status === UserStatus.DELETED
      ) {
        throw new Error("User Is Deleted");
      }

      // Link Google's unique user ID (sub) with the existing account.
      // After linking, the user can log in using either authentication method.
      user = await prisma.user.update({
        where: {
          id: ifPatientExistWithCredentials.id,
        },

        data: {
          googleId: googleIdTokenPayload.sub,
        },
      });
    } else {
      // If neither a Google account nor a credential account exists,
      // create a completely new patient account using Google's information.
      user = await prisma.user.create({
        data: {
          name: googleIdTokenPayload.name,
          email: googleIdTokenPayload.email,
          role: Role.PATIENT,
          googleId: googleIdTokenPayload.sub,
          authProvider: AuthProvider.GOOGLE,

          // Google has already verified the email address.
          emailVerified: true,

          // Create the associated patient profile simultaneously
          // using Prisma's nested create operation.
          patient: {
            create: {
              name: googleIdTokenPayload.name,
              email: googleIdTokenPayload.email,
            },
          },
        },
      });
    }
  }

  // Ensure that a valid user object is available before generating tokens.
  if (!user) {
    throw new Error("User Not Found");
  }

  // Perform a final account-status check.
  // This also protects existing Google users from accessing blocked accounts.
  if (user.status === UserStatus.BLOCKED) {
    throw new Error("User Is Blocked");
  }

  // Prevent deleted users from logging in, regardless of their authentication method.
  if (user.isDeleted || user.status === UserStatus.DELETED) {
    throw new Error("User Is Deleted");
  }

  // Prepare the payload that will be stored inside the JWT tokens.
  // These details identify the authenticated user throughout the application.
  const jwtPayload = {
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  // Generate an access token.
  // The access token is used to authenticate requests to protected APIs.
  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_access_secret,
    config.jwt_access_expires_in as SignOptions,
  );

  // Generate a refresh token.
  // The refresh token is used to obtain a new access token when the current
  // access token expires, without requiring the user to log in again.
  const refreshToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_refresh_secret,
    config.jwt_refresh_expires_in as SignOptions,
  );

  // Return both tokens to the controller so they can be sent to the client.
  return {
    accessToken,
    refreshToken,
  };
};

const forgotPaswordService = (payload: any) => {};
const resetPaswordService = (payload: any) => {};

export const authServices = {
  registerUserService,
  loginUserService,
  getMyProfileService,
  refreshTokenService,
  googleLoginService,
  forgotPaswordService,
  resetPaswordService,
};
