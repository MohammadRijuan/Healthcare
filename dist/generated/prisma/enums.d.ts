export declare const Role: {
    readonly SUPER_ADMIN: 'SUPER_ADMIN';
    readonly ADMIN: 'ADMIN';
    readonly DOCTOR: 'DOCTOR';
    readonly PATIENT: 'PATIENT';
};
export type Role = (typeof Role)[keyof typeof Role];
export declare const UserStatus: {
    readonly ACTIVE: 'ACTIVE';
    readonly BLOCKED: 'BLOCKED';
    readonly DELETED: 'DELETED';
};
export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];
export declare const Gender: {
    readonly MALE: 'MALE';
    readonly FEMALE: 'FEMALE';
    readonly OTHER: 'OTHER';
};
export type Gender = (typeof Gender)[keyof typeof Gender];
export declare const AuthProvider: {
    readonly GOOGLE: 'GOOGLE';
    readonly CREDENTIAL: 'CREDENTIAL';
};
export type AuthProvider = (typeof AuthProvider)[keyof typeof AuthProvider];
export declare const AppointmentStatus: {
    readonly PENDING: 'PENDING';
    readonly CONFIRMED: 'CONFIRMED';
    readonly CANCELLED: 'CANCELLED';
    readonly ONGOING: 'ONGOING';
    readonly COMPLETED: 'COMPLETED';
};
export type AppointmentStatus = (typeof AppointmentStatus)[keyof typeof AppointmentStatus];
export declare const PaymentStatus: {
    readonly UNPAID: 'UNPAID';
    readonly PAID: 'PAID';
    readonly FAILED: 'FAILED';
    readonly CANCELLED: 'CANCELLED';
    readonly REFUNDED: 'REFUNDED';
};
export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];
export declare const DoctorVerificationStatus: {
    readonly PENDING: 'PENDING';
    readonly APPROVED: 'APPROVED';
    readonly REJECTED: 'REJECTED';
};
export type DoctorVerificationStatus = (typeof DoctorVerificationStatus)[keyof typeof DoctorVerificationStatus];
//# sourceMappingURL=enums.d.ts.map