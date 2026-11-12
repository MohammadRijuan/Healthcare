declare const uploadProfileImageService: (buffer: Buffer, userId: string) => Promise<{
    id: string;
    name: string;
    email: string;
    googleId: string | null;
    emailVerified: boolean;
    role: import("../../../generated/prisma/enums").Role;
    authProvider: import("../../../generated/prisma/enums").AuthProvider;
    status: import("../../../generated/prisma/enums").UserStatus;
    needPasswordChange: boolean;
    imageUrl: string;
    imagePublicId: string;
    isDeleted: boolean;
    deletedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare const userServices: {
    uploadProfileImageService: typeof uploadProfileImageService;
};
export {};
//# sourceMappingURL=user.service.d.ts.map