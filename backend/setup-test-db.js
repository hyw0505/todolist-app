const { Pool } = require('pg');

// postgres 사용자로 시스템 데이터베이스에 연결
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'postgres'
});

async function setupTestDatabase() {
  try {
    // 1. 테스트 사용자 생성 (이미 존재하면 무시)
    console.log('1. 테스트 사용자 생성 중...');
    try {
      await pool.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'todolist-test-user') THEN
            CREATE ROLE "todolist-test-user" WITH LOGIN PASSWORD 'todolist-test-pass';
          END IF;
        END
        $$;
      `);
      console.log('   - 테스트 사용자 확인/생성 완료');
    } catch (err) {
      console.log('   - 사용자 생성 오류:', err.message);
    }

    // 2. 테스트 데이터베이스 생성 (이미 존재하면 무시)
    console.log('2. 테스트 데이터베이스 생성 중...');
    try {
      await pool.query(`
        SELECT pg_terminate_backend(pid)
        FROM pg_stat_activity
        WHERE datname = 'todolist_test' AND pid <> pg_backend_pid();
      `);
      
      const dbExists = await pool.query(`
        SELECT 1 FROM pg_database WHERE datname = 'todolist_test'
      `);
      
      if (dbExists.rows.length === 0) {
        await pool.query(`CREATE DATABASE todolist_test`);
        console.log('   - todolist_test 데이터베이스 생성 완료');
      } else {
        console.log('   - todolist_test 데이터베이스 이미 존재함');
      }
    } catch (err) {
      console.log('   - 데이터베이스 생성 오류:', err.message);
    }

    // 3. 사용자에게 권한 부여
    console.log('3. 사용자 권한 부여 중...');
    try {
      await pool.query(`GRANT ALL PRIVILEGES ON DATABASE todolist_test TO "todolist-test-user"`);
      console.log('   - 데이터베이스 권한 부여 완료');
    } catch (err) {
      console.log('   - 권한 부여 오류:', err.message);
    }

    // 4. 테스트 데이터베이스에 연결하여 스키마 생성
    console.log('4. 테이블 스키마 생성 중...');
    const testPool = new Pool({
      host: 'localhost',
      port: 5432,
      database: 'todolist_test',
      user: 'postgres',
      password: 'postgres'
    });

    try {
      // users 테이블 생성
      await testPool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email VARCHAR(255) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          name VARCHAR(50) NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `);
      console.log('   - users 테이블 생성 완료');

      // todos 테이블 생성
      await testPool.query(`
        CREATE TABLE IF NOT EXISTS todos (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          start_date DATE NOT NULL,
          due_date DATE NOT NULL,
          is_completed BOOLEAN NOT NULL DEFAULT false,
          is_success BOOLEAN,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `);
      console.log('   - todos 테이블 생성 완료');

      // 사용자에게 테이블 권한 부여
      await testPool.query(`GRANT ALL PRIVILEGES ON TABLE users TO "todolist-test-user"`);
      await testPool.query(`GRANT ALL PRIVILEGES ON TABLE todos TO "todolist-test-user"`);
      await testPool.query(`GRANT ALL PRIVILEGES ON SEQUENCE pg_catalog.pg_sequence TO "todolist-test-user"`);
      console.log('   - 테이블 권한 부여 완료');

      await testPool.end();
    } catch (err) {
      console.log('   - 스키마 생성 오류:', err.message);
      await testPool.end();
    }

    console.log('\n✅ 테스트 데이터베이스 설정 완료!');
  } catch (err) {
    console.error('❌ 오류 발생:', err.message);
  } finally {
    pool.end();
  }
}

setupTestDatabase();
