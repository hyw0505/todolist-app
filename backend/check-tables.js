const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'todolist_dev',
  user: 'postgres',
  password: 'postgres'
});

async function checkTables() {
  try {
    // 테이블 목록 확인
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    console.log('=== 테이블 목록 ===');
    console.log(tablesResult.rows.map(r => r.table_name).join(', ') || '테이블 없음');
    
    // users 테이블 확인
    console.log('\n=== users 테이블 구조 ===');
    const usersResult = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `);
    if (usersResult.rows.length > 0) {
      console.log(usersResult.rows.map(r => `  ${r.column_name}: ${r.data_type} (${r.is_nullable})`).join('\n'));
    } else {
      console.log('users 테이블이 없습니다');
    }
    
    // todos 테이블 확인
    console.log('\n=== todos 테이블 구조 ===');
    const todosResult = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'todos'
      ORDER BY ordinal_position
    `);
    if (todosResult.rows.length > 0) {
      console.log(todosResult.rows.map(r => `  ${r.column_name}: ${r.data_type} (${r.is_nullable})`).join('\n'));
    } else {
      console.log('todos 테이블이 없습니다');
    }
    
    // 권한 확인
    console.log('\n=== 테이블 권한 ===');
    const grantsResult = await pool.query(`
      SELECT table_name, privilege_type
      FROM information_schema.role_table_grants
      WHERE grantee = 'postgres'
      ORDER BY table_name, privilege_type
    `);
    console.log(grantsResult.rows.map(r => `  ${r.table_name}: ${r.privilege_type}`).join('\n') || '권한 정보 없음');
    
  } catch (err) {
    console.error('에러 발생:', err.message);
  } finally {
    pool.end();
  }
}

checkTables();
