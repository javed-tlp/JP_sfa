// // utils/otpService.js
const OTP_LENGTH = 6;

const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000);
};

const sendOtpToCustomer = async (mobileNumber) => {
    const otp = generateOtp();
    const message = `Your OTP code is ${otp}. It is valid for 60 Seconds.`;

    console.log(`Sending OTP to ${mobileNumber}: ${message}`);

    return { success: true, otp };
};

module.exports = sendOtpToCustomer;





// const { Vonage } = require('@vonage/server-sdk');

// const vonage = new Vonage({
//     apiKey: "91671b9a",
//     apiSecret: "MFGPPuBZS2HSGB4A",
// });

// const OTP_LENGTH = 6;

// const generateOtp = () => {
//     return Math.floor(100000 + Math.random() * 900000);
// };

// const sendOtpToCustomer = async (mobileNumber) => {
//     const formattedNumber = mobileNumber.startsWith('91') ? mobileNumber : `91${mobileNumber}`;

//     const otp = generateOtp();
//     const message = `Your OTP code is ${otp}. It is valid for 5 minutes.`;

//     try {
//         const response = await vonage.sms.send({ to: formattedNumber, from: "Vonage", text: message });

//         if (response.messages[0].status === "0") {
//             console.log("OTP sent successfully to", formattedNumber);
//             return { success: true, otp };
//         } else {
//             console.error("Failed to send OTP:", response.messages[0]["error-text"]);
//             return { success: false, error: response.messages[0]["error-text"] };
//         }
//     } catch (error) {
//         console.error("Error sending OTP:", error);
//         return { success: false, error: error.message };
//     }
// };

// module.exports = sendOtpToCustomer;
