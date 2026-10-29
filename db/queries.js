const pool = require("./pool");


async function getUser(username) {
  const { rows } = await pool.query(
    `SELECT u.*, m.*
    FROM users u
    JOIN memberships m ON u.membership = m.membership
    WHERE u.username = $1`,
    [username]
  );
  return rows[0] || null;
}


async function getAllMessages() {
  const { rows } = await pool.query("SELECT * FROM messages");
  return rows;
}


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
  console.log(membershipCode);
  try {
    const membershipResult = await pool.query(`
      SELECT membership
      FROM memberships
      WHERE code = $1`,
      [membershipCode]
    );
    if (membershipResult.rows.length === 0) {
      return [{ msg: "Input code was not recognized." }];
    }

    const membership = membershipResult.rows[0].membership;

    const updateUserResult = await pool.query(
      `UPDATE users
       SET membership = $2
       WHERE username = $1`,
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


async function createMessage(title, username, body) {
  const errors = [];
  try {
    await pool.query("INSERT INTO messages (title, author_id, body) VALUES ($1, $2, $3)", [title, username, body]);
  }
  catch (err) {
    errors.push({ msg: `error: ${err.message}` });
  }
  return errors;
}


module.exports = {
  getUser,
  getAllMessages,
  createUser,
  updateUserMembership,
  createMessage,
};
