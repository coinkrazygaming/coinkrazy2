const bcrypt = require("bcryptjs");

const password = "Woot6969!";
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error("Error generating hash:", err);
  } else {
    console.log("Password:", password);
    console.log("BCrypt Hash:", hash);
    console.log("\nUse this hash in your database seed file:");
    console.log(`'${hash}'`);
  }
});
