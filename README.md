# myTODO

개인용 할 일 저장 및 관리 웹서비스. 로그인 없이 바로 사용합니다.

## 기술 스택
- 프론트엔드: HTML/CSS/JS + Tailwind CSS (CDN, `public/`)
- 백엔드: Cloudflare Pages Functions (`functions/`)
- 데이터베이스: Cloudflare D1 (`schema.sql`)

## 로컬 개발

```bash
npm install
npm run db:migrate:local   # 로컬 D1에 스키마 적용
npm run dev                 # http://localhost:8788
```

## 배포

```bash
npm run db:create                 # D1 데이터베이스 생성 (최초 1회, database_id를 wrangler.toml에 반영)
npm run db:migrate:remote         # 원격 D1에 스키마 적용
npm run deploy                    # Cloudflare Pages 배포
```

## API

| Method | Path              | 설명        |
| ------ | ----------------- | ----------- |
| GET    | /api/todos        | 목록 조회   |
| POST   | /api/todos        | 할 일 추가  |
| PUT    | /api/todos/:id    | 할 일 수정  |
| DELETE | /api/todos/:id    | 할 일 삭제  |
