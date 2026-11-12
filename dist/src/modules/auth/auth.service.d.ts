import { IForgotPasswordPayload, IGoogleLoginPayload, IloginUserPayload, IRegisterPatientPayload, IRequestUser, IResetPasswordPayload, IVerifyEmailPayload } from "./auth.interface";
import { AuthProvider, Role, UserStatus } from "../../../generated/prisma/enums";
declare const registerUserService: (payload: IRegisterPatientPayload) => Promise<void>;
declare const verifyUserEmailService: (payload: IVerifyEmailPayload) => Promise<{
    user: {
        id: string;
        name: string;
        email: string;
        googleId: string | null;
        emailVerified: boolean;
        role: Role;
        authProvider: AuthProvider;
        status: UserStatus;
        needPasswordChange: boolean;
        imageUrl: string;
        imagePublicId: string;
        isDeleted: boolean;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    };
    patient: {
        id: string;
        name: string;
        email: string;
        contactNumber: string | null;
        address: string | null;
        isDeleted: boolean;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    } | null;
    accessToken: string;
    refreshToken: string;
}>;
declare const loginUserService: (payload: IloginUserPayload) => Promise<{
    accessToken: string;
    refreshToken: string;
}>;
declare const getMyProfileService: (user: IRequestUser) => Promise<{
    patient: {
        id: string;
        name: string;
        email: string;
        contactNumber: string | null;
        address: string | null;
        isDeleted: boolean;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    } | null;
} & {
    id: string;
    name: string;
    email: string;
    googleId: string | null;
    emailVerified: boolean;
    role: Role;
    authProvider: AuthProvider;
    status: UserStatus;
    needPasswordChange: boolean;
    imageUrl: string;
    imagePublicId: string;
    isDeleted: boolean;
    deletedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}>;
declare const refreshTokenService: (token: string) => Promise<{
    accessToken: string;
    refreshToken: string;
}>;
declare const googleLoginService: (payload: IGoogleLoginPayload) => Promise<{
    accessToken: string;
    refreshToken: string;
}>;
declare const forgotPaswordService: (payload: IForgotPasswordPayload) => Promise<void>;
declare const resetPaswordService: (payload: IResetPasswordPayload) => Promise<void>;
export declare const authServices: {
    registerUserService: typeof registerUserService;
    loginUserService: typeof loginUserService;
    getMyProfileService: typeof getMyProfileService;
    refreshTokenService: typeof refreshTokenService;
    googleLoginService: typeof googleLoginService;
    forgotPaswordService: typeof forgotPaswordService;
    resetPaswordService: typeof resetPaswordService;
    verifyUserEmailService: typeof verifyUserEmailService;
};
export {};
//# sourceMappingURL=auth.service.d.ts.map