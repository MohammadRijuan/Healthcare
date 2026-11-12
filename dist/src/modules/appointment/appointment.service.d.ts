import { AppointmentStatus, PaymentStatus } from "../../../generated/prisma/enums";
import { RequestUser } from "../../middlewares/checkAuth";
declare const bookAppointment: (payload: any, user: RequestUser) => Promise<{
    paymentUrl: any;
}>;
declare const payAppointment: (payload: any, user: RequestUser) => Promise<{
    paymentUrl: any;
}>;
declare const bookAppointmentCallback: (query: Record<string, any>) => Promise<{
    redirectUrl: string;
    executedPaymentResult?: never;
} | {
    executedPaymentResult: any;
    redirectUrl: string;
}>;
declare const cancelAppointment: (payload: any) => Promise<{
    appointment: {
        id: string;
        status: AppointmentStatus;
        createdAt: Date;
        updatedAt: Date;
    };
    payment: {
        id: string;
        status: PaymentStatus;
        amount: import("@prisma/client-runtime-utils").Decimal;
        currency: string;
        paymentGateway: string;
        merchantInvoiceNumber: string;
        bkashPaymentId: string | null;
        bkashTrxId: string | null;
        payerReference: string | null;
        paidAt: string | null;
        gatewayResponse: import("@prisma/client/runtime/client").JsonValue | null;
        refundTrxId: string | null;
        refundAmount: import("@prisma/client-runtime-utils").Decimal | null;
        refundReason: string | null;
        refundedAt: string | null;
        appointmentId: string;
        createdAt: Date;
        updatedAt: Date;
    };
}>;
export declare const appointmentServices: {
    bookAppointment: typeof bookAppointment;
    bookAppointmentCallback: typeof bookAppointmentCallback;
    payAppointment: typeof payAppointment;
    cancelAppointment: typeof cancelAppointment;
};
export {};
//# sourceMappingURL=appointment.service.d.ts.map