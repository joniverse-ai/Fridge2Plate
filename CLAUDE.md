# 냉장고를털어라 (ClearFridge) — CLAUDE.md

## 프로젝트 개요

냉장고 재료를 입력하면 한국 가정식 레시피를 찾아주는 웹앱.
PRD: [PRD.md](PRD.md)

## 기술 스택

- **프레임워크**: Next.js 15 (App Router)
- **언어**: TypeScript
- **스타일**: Tailwind CSS
- **백엔드/DB**: Supabase (PostgreSQL)
- **패키지 매니저**: npm

## 프로젝트 구조

```
src/
  app/                  # Next.js App Router 페이지
    page.tsx            # 메인 — 냉장고 랜딩 + 재료 입력
    recipes/
      page.tsx          # 검색 결과 목록
      [id]/page.tsx     # 레시피 상세 (유튜브 영상 포함)
    api/
      recipes/          # 레시피 검색 API
      youtube/          # 유튜브 영상 검색 API
  components/
    FridgeLanding.tsx   # 냉장고 열기 인터랙션
    IngredientInput.tsx # 재료 태그 입력
    RecipeCard.tsx      # 레시피 카드 (매칭률 표시)
    MissingIngredients.tsx  # 부족 재료 확인 (소스·양념 위주)
    YoutubeEmbed.tsx    # 유튜브 영상 임베드
  lib/                  # Supabase 클라이언트, 타입, 유틸리티
  data/                 # 목업 데이터 (개발용)
```

## 코드 규칙

- 컴포넌트는 함수형 + TypeScript
- 한국어 UI, 코드(변수·함수명)는 영어
- 커밋 메시지는 한국어도 OK
- `'use client'`는 실제로 클라이언트 훅을 쓰는 컴포넌트에만
- API 키, 시크릿은 반드시 `.env.local`에 — 절대 커밋하지 않음

## 명령어

```bash
npm run dev       # 개발 서버 (http://localhost:3000)
npm run build     # 프로덕션 빌드
npm run lint      # ESLint
```

## Supabase

- 프로젝트: `irkjisxmewxdatlytukr`
- MCP 서버로 직접 연결됨 — `mcp__supabase__*` 도구 사용 가능
- 마이그레이션은 Supabase MCP `apply_migration` 사용

## 외부 API

- **식약처 COOKRCP01** (공공데이터포털) — 레시피 데이터를 Supabase에 적재 후 자체 검색
- **YouTube Data API** — 레시피명으로 유튜브 검색하여 영상 링크 제공
- API 키는 모두 `.env.local`에 저장

## 재료 매칭 로직

- 재료는 **메인 재료**와 **소스·양념류**로 구분
- 매칭률 계산 시 사용자가 입력한 메인 재료의 비중을 크게 반영
- 부족 재료 확인 UI는 소스·양념류를 위주로 표시

## UI/UX 규칙

- **반응형 필수**: 모든 화면은 PC(데스크톱)와 모바일 모두 대응 (Tailwind 브레이크포인트 활용)
- 메인 페이지는 냉장고 이미지 랜딩 → 클릭 시 열리는 인터랙션으로 시작
- 유튜브 영상은 레시피 상세 페이지에 iframe 임베드

## 개발 흐름

1. 기능 단위로 작업
2. 로컬에서 확인 후 진행
3. 목업 데이터로 프론트 먼저 → 백엔드 연동 순서
