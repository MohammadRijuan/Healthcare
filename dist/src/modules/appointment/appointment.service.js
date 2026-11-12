"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.appointmentServices = void 0;
const enums_1 = require("../../../generated/prisma/enums");
const http_status_1 = __importDefault(require("http-status"));
const config_1 = __importDefault(require("../../config"));
const bkash_1 = require("../../lib/bkash");
const prisma_1 = require("../../lib/prisma");
const AppError_1 = require("../../utils/AppError");
const bookAppointment = async (payload, user) => {
    const transactioResult = await prisma_1.prisma.$transaction(async (tx) => {
        // business logic
        const appointment = await tx.appointment.create({
            data: {
                status: enums_1.AppointmentStatus.PENDING,
            },
        });
        const bkashIdToken = await (0, bkash_1.getBkashIdToken)();
        if (!bkashIdToken) {
            throw new AppError_1.AppError(http_status_1.default.BAD_GATEWAY, "No Bkash Access Token Found!");
        }
        //   console.log({ bkashIdToken });
        const bkashCreatePaymentResponse = await fetch(`${config_1.default.bkash_base_url}/tokenized/checkout/create`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: bkashIdToken,
                "X-App-Key": config_1.default.bkash_app_key,
            },
            body: JSON.stringify({
                mode: "0011", // its has to be 0011 not 0001
                payerReference: "0123456789", //user email or phone number
                callbackURL: `${config_1.default.bkash_callback_url}/appointment/book-appointment/payment/callback`,
                amount: "1200",
                currency: "BDT",
                intent: "sale",
                merchantInvoiceNumber: "Inv4", // apppointment id
            }),
        });
        const bkashCreatePaymentResult = await bkashCreatePaymentResponse.json();
        //   console.log({ bkashCreatePaymentResult });
        await tx.payment.create({
            data: {
                merchantInvoiceNumber: bkashCreatePaymentResult.merchantInvoiceNumber,
                appointmentId: appointment.id,
                amount: "1200",
                gatewayResponse: bkashCreatePaymentResult,
                bkashPaymentId: bkashCreatePaymentResult.paymentID,
                payerReference: user.email,
            },
        });
        return {
            paymentUrl: bkashCreatePaymentResult.bkashURL,
        };
    });
    return transactioResult;
};
const payAppointment = async (payload, user) => {
    const appointmentId = payload.appointmentId;
    const existingAppointment = await prisma_1.prisma.appointment.findUnique({
        where: {
            id: appointmentId,
        },
    });
    if (!existingAppointment) {
        throw new AppError_1.AppError(http_status_1.default.NOT_FOUND, "Appointment Does Not Exists");
    }
    if (existingAppointment.status !== "PENDING") {
        throw new AppError_1.AppError(http_status_1.default.CONFLICT, "Appointment Is Not Pending!");
    }
    // if (existingAppointment.status === "CANCELLED" || existingAppointment.status === "ONGOING" || existingAppointment.status === "COMPLETED"){
    //     const appointmentStatus = existingAppointment.status
    //     throw new Error(`Appointment is already ${appointmentStatus.toLowerCase}`)
    // }
    const bkashIdToken = await (0, bkash_1.getBkashIdToken)();
    if (!bkashIdToken) {
        throw new AppError_1.AppError(http_status_1.default.BAD_GATEWAY, "No Bkash Access Token Found!");
    }
    const bkashCreatePaymentResponse = await fetch(`${config_1.default.bkash_base_url}/tokenized/checkout/create`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: bkashIdToken,
            "X-App-Key": config_1.default.bkash_app_key,
        },
        body: JSON.stringify({
            mode: "0011",
            // payerReference: "0123456789", //user email or phone number
            payerReference: user.email, //user email or phone number
            callbackURL: `${config_1.default.bkash_callback_url}/appointment/book-appointment/payment/callback`,
            amount: "1200",
            currency: "BDT",
            intent: "sale",
            // merchantInvoiceNumber: "Inv4" // apppointment id
            merchantInvoiceNumber: existingAppointment.id, // apppointment id
        }),
    });
    const bkashCreatePaymentResult = await bkashCreatePaymentResponse.json();
    await prisma_1.prisma.payment.update({
        where: {
            appointmentId: existingAppointment.id,
        },
        data: {
            merchantInvoiceNumber: bkashCreatePaymentResult.merchantInvoiceNumber,
            gatewayResponse: bkashCreatePaymentResult,
            bkashPaymentId: bkashCreatePaymentResult.paymentID,
        },
    });
    return {
        paymentUrl: bkashCreatePaymentResult.bkashURL,
    };
};
const bookAppointmentCallback = async (query) => {
    const transactioResult = await prisma_1.prisma.$transaction(async (tx) => {
        const paymentId = query.paymentID;
        if (!paymentId) {
            throw new AppError_1.AppError(http_status_1.default.BAD_REQUEST, "Payment Id Missing");
        }
        const status = query.status;
        if (!status) {
            throw new AppError_1.AppError(http_status_1.default.BAD_REQUEST, "Payment Status is Missing");
        }
        const bkashIdToken = await (0, bkash_1.getBkashIdToken)();
        if (!bkashIdToken) {
            throw new AppError_1.AppError(http_status_1.default.BAD_GATEWAY, "No Bkash Access Token Found!");
        }
        const executedPaymentResponse = await fetch(`${config_1.default.bkash_base_url}/tokenized/checkout/execute`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: bkashIdToken,
                "X-App-Key": config_1.default.bkash_app_key,
            },
            body: JSON.stringify({
                paymentID: paymentId,
            }),
        });
        const executedPaymentResult = await executedPaymentResponse.json();
        if (status === "success") {
            await tx.appointment.update({
                where: {
                    id: executedPaymentResult.merchantInvoiceNumber,
                },
                data: {
                    status: enums_1.AppointmentStatus.CONFIRMED,
                },
            });
            await tx.payment.update({
                where: {
                    appointmentId: executedPaymentResult.merchantInvoiceNumber,
                    bkashPaymentId: paymentId,
                },
                data: {
                    status: enums_1.PaymentStatus.PAID,
                    bkashTrxId: executedPaymentResult.trxID,
                    paidAt: executedPaymentResult.paymentExecuteTime,
                    gatewayResponse: executedPaymentResult,
                },
            });
            return {
                redirectUrl: `${config_1.default.frontend_url}/dashboard/my-appointments?status=success`,
            };
        }
        else if (status === "failure") {
            await tx.payment.update({
                where: {
                    bkashPaymentId: paymentId,
                },
                data: {
                    status: enums_1.PaymentStatus.FAILED,
                    gatewayResponse: executedPaymentResult,
                },
            });
            return {
                redirectUrl: `${config_1.default.frontend_url}/dashboard/my-appointments?status=failue`,
            };
        }
        else if (status === "cancel") {
            await tx.payment.update({
                where: {
                    bkashPaymentId: paymentId,
                },
                data: {
                    status: enums_1.PaymentStatus.CANCELLED,
                    gatewayResponse: executedPaymentResult,
                },
            });
            return {
                redirectUrl: `${config_1.default.frontend_url}/dashboard/my-appointments?status=cancel`,
            };
        }
        else {
            return {
                executedPaymentResult,
                redirectUrl: `${config_1.default.frontend_url}/dashboard/my-appointments?error=payment-failed`,
            };
        }
    });
    return transactioResult;
};
const cancelAppointment = async (payload) => {
    const transactionResult = await prisma_1.prisma.$transaction(async (tx) => {
        const appointmentId = payload.appointmentId;
        const existingAppointment = await tx.appointment.findUnique({
            where: {
                id: appointmentId,
            },
            include: {
                payment: true,
            },
        });
        if (!existingAppointment) {
            throw new AppError_1.AppError(http_status_1.default.NOT_FOUND, "Appointment Does Not Exists");
        }
        if (existingAppointment.status === "ONGOING" ||
            existingAppointment.status === "COMPLETED") {
            throw new AppError_1.AppError(http_status_1.default.CONFLICT, "Appointment Ongoing or Completed");
        }
        if (existingAppointment.status === "CANCELLED") {
            throw new AppError_1.AppError(http_status_1.default.CONFLICT, "Appointment Already Cancelled");
        }
        const updatedAppointment = await tx.appointment.update({
            where: {
                id: existingAppointment.id,
            },
            data: {
                status: "CANCELLED",
            },
        });
        const bkashIdToken = await (0, bkash_1.getBkashIdToken)();
        if (!bkashIdToken) {
            throw new AppError_1.AppError(http_status_1.default.BAD_GATEWAY, "No Bkash Access Token Found!");
        }
        const bkashRefundPaymentResponse = await fetch(`${config_1.default.bkash_base_url}/tokenized/checkout/payment/refund`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: bkashIdToken,
                "X-App-Key": config_1.default.bkash_app_key,
            },
            body: JSON.stringify({
                paymentID: existingAppointment.payment?.bkashPaymentId,
                trxID: existingAppointment.payment?.bkashTrxId,
                amount: existingAppointment.payment?.amount.toString(),
                sku: "Appointment Cancellation",
                reason: "Patient Cancelled The Appointment",
            }),
        });
        const bkashRefundPaymentResult = await bkashRefundPaymentResponse.json();
        const updatedPayment = await tx.payment.update({
            where: {
                appointmentId: existingAppointment.id,
            },
            data: {
                refundTrxId: bkashRefundPaymentResult.refundTrxID,
                refundedAt: bkashRefundPaymentResult.completedTime,
                refundAmount: bkashRefundPaymentResult.amount,
                refundReason: "Patient Cancelled The Appointment",
                status: enums_1.PaymentStatus.REFUNDED,
                gatewayResponse: bkashRefundPaymentResult,
            },
        });
        return {
            appointment: updatedAppointment,
            payment: updatedPayment,
        };
    });
    return transactionResult;
};
exports.appointmentServices = {
    bookAppointment,
    bookAppointmentCallback,
    payAppointment,
    cancelAppointment
};
//# sourceMappingURL=appointment.service.js.map