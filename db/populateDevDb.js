const { Client } = require("pg");
const { argv } = require('node:process');

// connects to .env file in root folder, this is needed here because just running this file misses the loadEnvFile() in app.js
try {
  process.loadEnvFile();
} catch(error) {}


// DROP TABLE IF EXISTS users;
// DROP TABLE IF EXISTS messages;
// the above can be added or removed from the start as needed
const SQL = `
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS users;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  username VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  membership VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS messages (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author_id BIGINT NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  body TEXT NOT NULL
);

`;

/*

*/

async function main() {
  console.log("seeding...");
  let client;

  // default "npm run app" has 2 arguments: [0] node and [1] app.js. Extra argv[2] would be the URL to the DB
  if(argv.length > 3) {
    throw new Error("Too many arguments detected!");
  }
  else if(argv.length < 3) {
    // default to .env DB
    client = new Client({
      connectionString: process.env.LOCAL_DB_URL,
    });
  }
  else {
    client = new Client({
      connectionString: argv[2],
    });
  }

  await client.connect();
  await client.query(SQL);
  await client.end();
  console.log("done");
}

main();