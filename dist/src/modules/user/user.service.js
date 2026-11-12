"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userServices = void 0;
const cloudinary_1 = require("../../lib/cloudinary");
const prisma_1 = require("../../lib/prisma");
const uploadProfileImageService = async (buffer, userId) => {
    // const cloudinaryResult = cloudinary.uploader.upload_stream(
    //     {
    //         resource_type : "auto"
    //     },
    //     async (error, result) => {
    //         if(error){
    //             console.log(error);
    //             throw new Error(error.message)
    //         }
    //         console.log(result, "result");
    //         const updatedUser = await prisma.user.update({
    //             where : {
    //                 id : userId
    //             },
    //             data: {
    //                 imageUrl : result?.secure_url,
    //                 imagePublicId : result?.public_id
    //             }
    //         })
    //         console.log(updatedUser);
    //         // return result
    //     }
    // ).end(buffer)
    const currentUser = await prisma_1.prisma.user.findUnique({
        where: {
            id: userId
        },
        select: {
            imagePublicId: true,
            imageUrl: true
        }
    });
    const cloudinaryResult = await new Promise((resolve, reject) => {
        cloudinary_1.cloudinary.uploader.upload_stream({
            resource_type: "auto"
        }, async (error, result) => {
            if (error) {
                return reject(error);
            }
            if (!result) {
                return reject(new Error("No result returned from Cloudinary"));
            }
            resolve(result);
        }).end(buffer);
    });
    const updatedUser = await prisma_1.prisma.user.update({
        where: {
            id: userId
        },
        data: {
            imageUrl: cloudinaryResult.secure_url,
            imagePublicId: cloudinaryResult.public_id
        },
        omit: {
            password: true
        }
    });
    if (currentUser?.imagePublicId && currentUser.imageUrl) {
        await cloudinary_1.cloudinary.uploader.destroy(currentUser.imagePublicId);
    }
    return updatedUser;
};
exports.userServices = {
    uploadProfileImageService
};
//# sourceMappingURL=user.service.js.map