const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase
const serviceAccount = require(path.join(__dirname,'firebaseServiceAccount.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'iti-final-grad-proj.appspot.com', // Replace with your Firebase project ID
});

const bucket = admin.storage().bucket();
module.exports = bucket;
