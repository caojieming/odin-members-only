const pool = require("./pool");


async function createUser(name, username, hashedPassword) {
  const errors = [];
  try {
    await pool.query("INSERT INTO users (name, username, password, membership) VALUES ($1, $2, $3, $4)", [name, username, hashedPassword, "Basic"]);
  }
  catch (err) {
    // specific error code for primary key conflict
    if (err.code === "23505") {
      errors.push({ msg: "Input username is not available." });
    }
  }
  return errors;
}


async function updateUserMembership(username, membershipCode) {
  try {
    const membershipResult = await pool.query(`
      SELECT membership
      FROM memberships
      WHERE code = $1;`,
      [membershipCode]
    );
    if (membershipResult.rows.length === 0) {
      return [{ msg: "Input code was not recognized." }];
    }

    const membership = membershipResult.rows[0].membership;

    const updateUserResult = await pool.query(
      `UPDATE users
       SET membership = $2
       WHERE username = $1;`,
      [username, membership]
    );
    if (updateUserResult.rowCount === 0) {
      return [{ msg: "User not found." }];
    }

    return [];
  }
  catch (err) {
    return [{ msg: `Something unexpected happened: ${err}` }];
  }
}


module.exports = {
  createUser,
  updateUserMembership,
};
