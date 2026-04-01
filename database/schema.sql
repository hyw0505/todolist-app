-- =============================================================
-- todolist-app Database Schema
-- 참조: docs/6-erd.md
-- 작성일: 2026-04-01
-- =============================================================

-- UUID 생성 확장 활성화
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================
-- 테이블 초기화 (개발 환경 재실행 시)
-- =============================================================
DROP TABLE IF EXISTS todos;
DROP TABLE IF EXISTS users;

-- =============================================================
-- users 테이블
-- =============================================================
CREATE TABLE users (
    id           UUID        NOT NULL DEFAULT gen_random_uuid(),
    email        VARCHAR(255) NOT NULL,
    password     VARCHAR(255) NOT NULL,           -- bcrypt 암호화 저장
    name         VARCHAR(50)  NOT NULL,
    created_at   TIMESTAMP   NOT NULL DEFAULT NOW(),

    CONSTRAINT users_pkey         PRIMARY KEY (id),
    CONSTRAINT users_email_unique UNIQUE (email)
);

COMMENT ON TABLE  users            IS '사용자 계정';
COMMENT ON COLUMN users.id         IS '사용자 고유 식별자';
COMMENT ON COLUMN users.email      IS '로그인 계정 (고유값)';
COMMENT ON COLUMN users.password   IS 'bcrypt(salt=10) 암호화된 비밀번호';
COMMENT ON COLUMN users.name       IS '표시 이름 (1~50자)';
COMMENT ON COLUMN users.created_at IS '가입 일시';

-- =============================================================
-- todos 테이블
-- status 컬럼 없음 → 서버에서 런타임 계산
-- =============================================================
CREATE TABLE todos (
    id           UUID        NOT NULL DEFAULT gen_random_uuid(),
    user_id      UUID        NOT NULL,
    title        VARCHAR(100) NOT NULL,
    description  TEXT,                            -- 선택, 최대 1000자는 앱 레이어에서 검증
    start_date   DATE        NOT NULL,
    due_date     DATE        NOT NULL,
    is_completed BOOLEAN     NOT NULL DEFAULT FALSE,
    is_success   BOOLEAN,                         -- 완료 처리(is_completed=true) 시에만 유효
    created_at   TIMESTAMP   NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMP   NOT NULL DEFAULT NOW(),

    CONSTRAINT todos_pkey          PRIMARY KEY (id),
    CONSTRAINT todos_user_id_fk    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT todos_due_after_start CHECK (due_date >= start_date)
);

COMMENT ON TABLE  todos              IS '할일';
COMMENT ON COLUMN todos.id           IS '할일 고유 식별자';
COMMENT ON COLUMN todos.user_id      IS '소유 사용자 (FK → users.id)';
COMMENT ON COLUMN todos.title        IS '할일 제목 (1~100자)';
COMMENT ON COLUMN todos.description  IS '할일 상세 내용 (선택, 최대 1000자)';
COMMENT ON COLUMN todos.start_date   IS '시작일 (필수)';
COMMENT ON COLUMN todos.due_date     IS '종료일 (필수, start_date 이상)';
COMMENT ON COLUMN todos.is_completed IS '사용자 완료 처리 여부 (기본값: false)';
COMMENT ON COLUMN todos.is_success   IS '성공 여부 — is_completed=true 일 때만 유효 (true: 성공, false: 실패)';
COMMENT ON COLUMN todos.created_at   IS '생성 일시';
COMMENT ON COLUMN todos.updated_at   IS '최종 수정 일시';

-- =============================================================
-- 인덱스
-- =============================================================

-- 이메일 조회 (로그인 시 빈번한 쿼리)
CREATE INDEX idx_users_email      ON users (email);

-- 사용자별 할일 조회 (가장 빈번한 쿼리)
CREATE INDEX idx_todos_user_id    ON todos (user_id);

-- 정렬 기준 컬럼 (BR-07: 시작일·종료일 정렬)
CREATE INDEX idx_todos_start_date ON todos (start_date);
CREATE INDEX idx_todos_due_date   ON todos (due_date);

-- 복합 인덱스: 사용자별 상태 필터 + 정렬 최적화
CREATE INDEX idx_todos_user_status ON todos (user_id, is_completed, start_date, due_date);

-- =============================================================
-- updated_at 자동 갱신 트리거
-- =============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER todos_set_updated_at
    BEFORE UPDATE ON todos
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();
