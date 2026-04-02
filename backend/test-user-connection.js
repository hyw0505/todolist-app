const { Pool } = require('pg');

// 테스트용 pool 직접 생성
const testPool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'todolist_test',
  user: 'todolist-test-user',
  password: 'todolist-test-pass'
});

async function testConnection() {
  try {
    console.log('테스트 사용자로 연결 중...');
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
    
    console.log('\n✅ 모든 테스트 성공!');
  } catch (err) {
    console.error('❌ 연결 실패:', err.message);
  } finally {
    await testPool.end();
  }
}

testConnection();
