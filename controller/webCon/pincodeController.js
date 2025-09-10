const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const Pincode = require('../../models/webMod/pincodeModel'); // Adjust the path if needed

exports.importPincodeData = async (req, res) => {
  const filePath = path.join(__dirname, '../../assets/newcorrectpincodes.csv'); // Ensure the correct path
  const pincodes = [];

  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (row) => {
      // Check if all required fields are present
      if (row.postOfficeName && row.pincode && row.district && row.city && row.state) {
        pincodes.push({
          postOfficeName: row.postOfficeName.trim(),
          pincode: parseInt(row.pincode, 10), // Ensure the pincode is an integer
          district: row.district.trim(),
          city: row.city.trim(),
          state: row.state.trim(),
        });
      } else {
        console.log('Skipping incomplete row:', row);
      }
    })
    .on('end', async () => {
      try {
        if (pincodes.length === 0) {
          return res.status(400).json({ message: 'No valid data found in the CSV file' });
        }
        // Insert into MongoDB
        await Pincode.insertMany(pincodes);
        console.log('Data successfully imported into MongoDB');
        res.status(200).json({ message: 'Pincode data imported successfully', insertedCount: pincodes.length });
      } catch (error) {
        console.error('Error inserting data into MongoDB:', error);
        res.status(500).json({ message: 'Failed to import pincode data', error });
      }
    })
    .on('error', (error) => {
      console.error('Error reading the CSV file:', error);
      res.status(500).json({ message: 'Failed to read CSV file', error });
    });
};
