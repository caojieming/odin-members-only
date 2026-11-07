const { argv } = require('node:process');
const { Pool } = require("pg");

function getPool() {
  console.log(`Detected ${argv.length - 2} extra arg(s)`);

  // default "npm run app" has 2 arguments: [0] node and [1] app.js
  if(argv.length < 3) {
    return new Pool({
      connectionString: process.env.LOCAL_DB_URL
    });
  }
  else if(argv.length > 3) {
    throw new Error("Too many arguments detected");
  }
  else {
    // looking at the extra arg, aka arg[2]
    if(argv[2] === "server") {
      return new Pool({
        connectionString: process.env.SERVER_DB_URL
      });
    }
    else {
      return new Pool({
        connectionString: argv[2]
      });
    }
  }
}

module.exports = getPool();