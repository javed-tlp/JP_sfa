const moment = require("moment-timezone");

// Function to get the current date and time in Indian Standard Time
const getCurrentDateTime = () => {
    const currentTime = moment.tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss");
    // console.log("Current DateTime (IST):", currentTime);
    return currentTime;
};

// Function to get a date and time 60 seconds from now in the desired format (YYYY-MM-DD HH:mm:ss)
const getValidUptoTime = () => {
    const validUptoTime = moment.tz("Asia/Kolkata").add(60, 'seconds').format("YYYY-MM-DD HH:mm:ss");
    // console.log("ValidUpto DateTime (IST, 60 seconds from now):", validUptoTime);
    return validUptoTime;
};

// Function to format a date in Indian Standard Time
const formatDateTime = (date) => {
    const formattedDate = moment(date).tz("Asia/Kolkata").format("DD-MM-YYYY HH:mm:ss");
    // console.log("Formatted DateTime (IST):", formattedDate);
    return formattedDate;
};

// Function to get the start of today in IST
const getStartOfDay = () => {
    return moment.tz("Asia/Kolkata").startOf('day').format("YYYY-MM-DD HH:mm:ss");
};

// Function to get the end of today in IST
const getEndOfDay = () => {
    return moment.tz("Asia/Kolkata").endOf('day').format("YYYY-MM-DD HH:mm:ss");
};

// Function to get the start of the last month in IST
const getStartOfLastMonth = () => {
    return moment.tz("Asia/Kolkata").subtract(1, 'month').startOf('month').format("YYYY-MM-DD HH:mm:ss");
};

// Function to get the end of the last month in IST
const getEndOfLastMonth = () => {
    return moment.tz("Asia/Kolkata").subtract(1, 'month').endOf('month').format("YYYY-MM-DD HH:mm:ss");
};

module.exports = {
    getCurrentDateTime,
    getValidUptoTime,
    formatDateTime,
    getStartOfDay,
    getEndOfDay,
    getStartOfLastMonth,
    getEndOfLastMonth
};
