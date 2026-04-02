const { Pool } = require('pg');

// postgres 사용자로 시스템 데이터베이스에 연결
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'postgres'
});

async function fixTestDatabasePermissions() {
  try {
    console.log('1. todolist_test 데이터베이스에서 권한 확인 및 수정 중...');
    
    const testPool = new Pool({
      host: 'localhost',
      port: 5432,
      database: 'todolist_test',
      user: 'postgres',
      password: 'postgres'
    });

    // public 스키마 사용 권한 부여
    console.log('   - public 스키마 사용 권한 부여...');
    await testPool.query(`GRANT USAGE ON SCHEMA public TO "todolist-test-user"`);
    
    // 테이블에 대한 모든 권한 부여
    console.log('   - 테이블 권한 부여...');
    await testPool.query(`GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO "todolist-test-user"`);
    await testPool.query(`GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO "todolist-test-user"`);
    await testPool.query(`GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO "todolist-test-user"`);
    
    // 장래에 생성될 테이블/시퀀스에 대한 권한도 부여
    console.log('   - 장래 생성될 객체에 대한 권한 부여...');
    await testPool.query(`ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO "todolist-test-user"`);
    await testPool.query(`ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO "todolist-test-user"`);
    await testPool.query(`ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO "todolist-test-user"`);
    
    // 권한 확인
    console.log('\n2. 권한 확인 중...');
    const grantsResult = await testPool.query(`
      SELECT table_name, privilege_type, grantee
      FROM information_schema.role_table_grants
      WHERE table_name IN ('users', 'todos')
      AND grantee = 'todolist-test-user'
      ORDER BY table_name, privilege_type
    `);
    
    if (grantsResult.rows.length > 0) {
      console.log('   부여된 권한:');
      grantsResult.rows.forEach(row => {
        console.log(`     - ${row.table_name}: ${row.privilege_type}`);
      });
    } else {
      console.log('   경고: 부여된 권한이 없습니다!');
    }
    
    await testPool.end();
    console.log('\n✅ 권한 설정 완료!');
    
  } catch (err) {
    console.error('❌ 오류 발생:', err.message);
    console.error(err.stack);
  } finally {
    pool.end();
  }
}

fixTestDatabasePermissions();
