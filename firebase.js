const { initializeApp } = require("firebase/app");
const { getDatabase } = require("firebase/database");

const firebaseConfig = {
  apiKey: "AIzaSyBsFkOhhBsUc2WXI1EPl4-gm2ZK9zNIaTI",
  authDomain: "sifms-1498f.firebaseapp.com",
  databaseURL: "https://sifms-1498f-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "sifms-1498f",
  storageBucket: "sifms-1498f.firebasestorage.app",
  messagingSenderId: "718646069018",
  appId: "1:718646069018:web:09854daf0a59481dbe4ea3",
  measurementId: "G-4PXH6ECPM5"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

module.exports = db;