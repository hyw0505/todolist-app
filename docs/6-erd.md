# ERD (Entity Relationship Diagram)

**프로젝트명:** todolist-app
**문서 버전:** v0.1
**작성일:** 2026-04-01
**작성자:** Yongwoo

---

```mermaid
erDiagram
    users {
        uuid      id           PK
        varchar   email        UK  "로그인 계정"
        varchar   password         "bcrypt 암호화"
        varchar   name
        timestamp created_at
    }

    todos {
        uuid      id           PK
        uuid      user_id      FK  "소유 사용자"
        varchar   title            "최대 100자"
        text      description      "선택, 최대 1000자"
        date      start_date       "시작일 (필수)"
        date      due_date         "종료일 (필수)"
        boolean   is_completed     "완료 처리 여부"
        boolean   is_success       "성공 여부 (완료 시 유효)"
        timestamp created_at
        timestamp updated_at
    }

    users ||--o{ todos : "소유"
```

> `status` 컬럼은 DB에 저장하지 않는다.  
> `start_date`, `due_date`, `is_completed`, `is_success` 값으로 서버에서 런타임 계산한다.

---

## 변경 이력

| 버전 | 변경일 | 변경자 | 변경 내용 |
|------|--------|--------|-----------|
| v0.1 | 2026-04-01 | Yongwoo | 최초 작성 |
