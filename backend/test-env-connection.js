const { Pool } = require('pg');

// 환경 변수 직접 로드
require('dotenv').config({ path: '.env.test' });

console.log('환경 변수 확인:');
console.log('  NODE_ENV:', process.env.NODE_ENV);
console.log('  DB_NAME:', process.env.DB_NAME);
console.log('  DB_USER:', process.env.DB_USER);
console.log('  DB_PASSWORD:', process.env.DB_PASSWORD);
console.log('  DB_HOST:', process.env.DB_HOST);

// 테스트용 pool 직접 생성
const testPool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});

async function testConnection() {
  try {
    console.log('\n테스트 사용자로 연결 중...');
    const result = await testPool.query('SELECT current_user, current_database()');
    console.log('✅ 연결 성공!');
    console.log('   사용자:', result.rows[0].current_user);
    console.log('   데이터베이스:', result.rows[0].current_database);
    
    // 테이블 접근 테스트
    console.log('\n테이블 접근 테스트...');
    const usersResult = await testPool.query('SELECT COUNT(*) FROM users');
    console.log('   users 테이블: OK (레코드 수:', usersResult.rows[0].count, ')');
    
    const todosResult = await testPool.query('SELECT COUNT(*) FROM todos');
    console.log('   todos 테이블: OK (레코드 수:', todosResult.rows[0].count, ')');
    
    // INSERT 테스트
    console.log('\nINSERT 테스트...');
    await testPool.query("INSERT INTO users (email, password, name) VALUES ('test@example.com', 'hashedpw', 'Test')");
    console.log('   users 테이블 INSERT: OK');
    
    // 삭제
    await testPool.query("DELETE FROM users WHERE email = 'test@example.com'");
    console.log('   users 테이블 DELETE: OK');
    
    console.log('\n✅ 모든 테스트 성공!');
  } catch (err) {
    console.error('❌ 오류 발생:', err.message);
    console.error(err.stack);
  } finally {
    await testPool.end();
  }
}

testConnection();
