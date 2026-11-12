"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBkashIdToken = void 0;
const config_1 = __importDefault(require("../config"));
const http_status_1 = __importDefault(require("http-status"));
const redis_1 = require("./redis");
const AppError_1 = require("../utils/AppError");
const getBkashIdToken = async () => {
    try {
        // Redis keys used to store bKash ID token and refresh token
        const idTokenKey = "bkash:idToken";
        const refreshTokenKey = "bkash:refreshToken";
        // Get existing tokens from Redis
        let bkashIdToken = await redis_1.redisClient.get(idTokenKey);
        let bkashIdTokenTTL = await redis_1.redisClient.ttl(idTokenKey);
        let bkashRefreshToken = await redis_1.redisClient.get(refreshTokenKey);
        let bkashRefreshTokenTTL = await redis_1.redisClient.ttl(refreshTokenKey);
        console.log({
            bkashIdToken,
            bkashIdTokenTTL,
            bkashRefreshToken,
            bkashRefreshTokenTTL,
        });
        /*
          Refresh the ID token if:
          1. ID token is expired or has 10 minutes or less remaining.
          2. Refresh token exists in Redis.
          3. Refresh token has more than 10 minutes remaining.
    
          This allows us to generate a new ID token without requesting
          a completely new token grant.
        */
        if ((bkashIdTokenTTL <= 600 || !bkashIdToken) &&
            bkashRefreshToken &&
            bkashRefreshTokenTTL > 600) {
            // Request a new ID token using the existing refresh token
            const refreshTokenResponse = await fetch(`${config_1.default.bkash_base_url}/tokenized/checkout/token/refresh`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    username: config_1.default.bkash_username,
                    password: config_1.default.bkash_password,
                },
                body: JSON.stringify({
                    app_key: config_1.default.bkash_app_key,
                    app_secret: config_1.default.bkash_app_secret,
                    refresh_token: bkashRefreshToken,
                }),
            });
            // Stop execution if bKash rejects the refresh request
            if (!refreshTokenResponse.ok) {
                throw new AppError_1.AppError(http_status_1.default.BAD_GATEWAY, "Bkash Access Token Refresh Failed");
            }
            // Convert the API response into a JavaScript object
            const bkashRefreshTokenResult = await refreshTokenResponse.json();
            // Extract the newly generated ID token
            bkashIdToken = bkashRefreshTokenResult.id_token;
            // Store the new ID token in Redis for 1 hour
            await redis_1.redisClient.set(idTokenKey, bkashIdToken, {
                expiration: {
                    type: "EX",
                    value: 60 * 60,
                },
            });
            // Return the newly generated ID token
            return bkashIdToken;
        }
        /*
          If the existing ID token has more than 10 minutes remaining,
          there is no need to refresh it.
          Return the existing token directly.
        */
        if (bkashIdTokenTTL > 600) {
            return bkashIdToken;
        }
        /*
          If the refresh token is missing, expired, or has 10 minutes
          or less remaining, request a completely new token grant.
        */
        const response = await fetch(`${config_1.default.bkash_base_url}/tokenized/checkout/token/grant`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                username: config_1.default.bkash_username,
                password: config_1.default.bkash_password,
            },
            body: JSON.stringify({
                app_key: config_1.default.bkash_app_key,
                app_secret: config_1.default.bkash_app_secret,
            }),
        });
        // Stop execution if bKash rejects the token grant request
        if (!response.ok) {
            throw new AppError_1.AppError(http_status_1.default.BAD_GATEWAY, "Bkash Access Token Grant Failed");
        }
        // Convert the API response into a JavaScript object
        const result = await response.json();
        // Store the new ID token in Redis for 1 hour
        await redis_1.redisClient.set(idTokenKey, result.id_token, {
            expiration: {
                type: "EX",
                value: 60 * 60, // 1 hour
            },
        });
        // Store the new refresh token in Redis for 28 days
        await redis_1.redisClient.set(refreshTokenKey, result.refresh_token, {
            expiration: {
                type: "EX",
                value: 60 * 60 * 24 * 28, // 28 days
            },
        });
        // Return the newly generated ID token
        bkashIdToken = result.id_token;
        return bkashIdToken;
    }
    catch (error) {
        // Forward the error to the calling function
        if (error instanceof AppError_1.AppError) {
            throw error;
        }
        throw new AppError_1.AppError(http_status_1.default.BAD_GATEWAY, error instanceof Error ? error.message : "bKash token operation failed");
    }
};
exports.getBkashIdToken = getBkashIdToken;
//# sourceMappingURL=bkash.js.map