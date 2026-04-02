const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'todolist_dev',
  user: 'postgres',
  password: 'postgres'
});

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('DB 연결 실패:', err.message);
  } else {
    console.log('DB 연결 성공:', res.rows[0].now);
  }
  pool.end();
});
