// middleware/locationUtils.js

const axios = require('axios');

const fetchLocationDetailsByPostalCodeGeoNames = async (postalCode) => {
    const username = 'saifijaved616'; // Replace with your GeoNames username
    try {
        const response = await axios.get(`http://api.geonames.org/postalCodeSearchJSON?postalcode=${postalCode}&country=IN&username=${username}`);
        if (response.data?.postalCodes?.length > 0) {
            const { placeName: area, adminName1: state, adminName2: district, adminName3: city } = response.data.postalCodes[0];
            return { city, state, district, area };
        }
        throw new Error('No location data found for this postal code.');
    } catch (error) {
        throw new Error(`Failed to fetch location details: ${error.message}`);
    }
};

module.exports = {
    fetchLocationDetailsByPostalCodeGeoNames,
};
