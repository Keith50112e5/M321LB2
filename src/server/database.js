let pool = null;

const initializeMariaDB = () => {
  const mariadb = require("mariadb");
  pool = mariadb.createPool({
    database: process.env.DB_NAME || "mychat",
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "mychat",
    password: process.env.DB_PASSWORD || "mychatpassword",
    connectionLimit: 5,
  });
};

const executeSQL = async (query) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const res = await conn.query(query);
    return res;
  } catch (err) {
    console.log(err);
  } finally {
    if (conn) conn.release();
  }
};

const initializeDBSchema = async () => {
  const userTableQuery = `CREATE TABLE IF NOT EXISTS users (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    active INT DEFAULT 0,
    PRIMARY KEY (id)
  );`;
  await executeSQL(userTableQuery);
  const userSeed = `INSERT INTO users (name) VALUES
  ('john'),
  ('jane');`;
  const checkUsers = await executeSQL(`SELECT * FROM users;`);
  if (checkUsers.length < 1) await executeSQL(userSeed);
  const messageTableQuery = `CREATE TABLE IF NOT EXISTS messages (
    id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    message VARCHAR(255) NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );`;
  await executeSQL(messageTableQuery);
};

const initializeDB = async () => {
  initializeMariaDB();
  await initializeDBSchema();
};

module.exports = { executeSQL, initializeDB };
