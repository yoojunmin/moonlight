# 달빛 산책

친구 2~4명이 방 코드로 모여 플레이하는 독창적인 한국어 실시간 보드게임 MVP입니다. React, Vite, TypeScript, Express, Socket.IO, Zod를 사용합니다. Chrome, Edge, Firefox, Safari 최신 버전을 대상으로 합니다.

## 실행

Node.js LTS와 npm을 설치하고 저장소 루트에서 실행하세요.

```sh
npm install
npm run dev
```

Vite 개발 서버와 Express/Socket.IO 서버를 함께 실행합니다. 개발 중에는 프런트엔드가 `/socket.io`를 `localhost:3000`으로 프록시합니다.

```sh
npm run build
npm start
npm test
```

빌드는 TypeScript 타입 검사 후 프런트엔드를 `dist/`에 만듭니다. Express는 같은 출처에서 정적 파일, Socket.IO, `/health`를 제공합니다. `PORT` 환경 변수를 읽고 `0.0.0.0`에 바인딩합니다. `.env.example`의 `PORT`와 `NODE_ENV`는 로컬 예시이며 Render가 `PORT`를 할당합니다.

## GitHub

```sh
git init
git add .
git commit -m "Build Moonlight Walk MVP"
git branch -M main
git remote add origin https://github.com/USER/REPOSITORY.git
git push -u origin main
```

## Render 배포

GitHub에 푸시한 뒤 Render 대시보드에서 **New → Web Service**를 선택해 저장소를 연결합니다. `render.yaml`을 사용하거나 다음 명령을 입력하세요.

- Runtime: Node
- Build Command: `npm install && npm run build`
- Start Command: `npm start`
- Health Check Path: `/health`
- Environment: `NODE_ENV=production`; `PORT`는 Render가 제공합니다.

Render의 웹 서비스는 같은 출처의 Socket.IO 기본 경로를 사용하며 WebSocket 업그레이드와 폴백 전송을 지원합니다. 배포 뒤 `/health` 응답과 브라우저 개발자 도구의 Socket.IO 연결이 WebSocket으로 유지되는지 확인하세요. 연결이 끊기면 클라이언트가 재연결을 시도하고 저장된 플레이어 토큰으로 방 자리를 복구합니다. 배포 인스턴스는 단일 프로세스/메모리 방 저장소를 가정합니다.

## 규칙과 MVP 범위

32칸의 독창적인 사각 보드에서 두 주사위로 시계 방향 이동합니다. 출발점을 통과하거나 정확히 도착하면 200원을 얻습니다. 서버가 주사위, 행동 권한과 단계를 검증합니다. 비어 있는 부동산 구매, 세트 소유 통행료 보너스, 균등 건설(최대 3단계), 카드/세금/이동 이벤트, 파산과 120턴 제한 승리를 지원합니다. 현금과 남은 부동산 가치 기준으로 승자를 정합니다.

거래, 경매, 채팅은 MVP에서 제외했습니다. 메뉴 버튼만 있는 미구현 기능은 없습니다. 부동산 소유권은 파산 시 무소유로 되돌아가며, 플레이어의 파산은 자산 매각 없이 즉시 처리됩니다. 호스트가 대기실에서 나가면 다음 플레이어로 호스트를 넘깁니다. 대기실의 연결 끊긴 플레이어 자리는 2분 뒤 정리되고, 진행 중 연결 끊김은 재접속 유예 없이 90초 턴 제한이 만료되면 서버가 해당 차례를 자동으로 넘깁니다.

**방과 게임은 메모리에만 저장됩니다. 프로세스/서버가 재시작되면 모든 방과 게임이 초기화됩니다.** 영속화가 필요해지면 `RoomRepository` 인터페이스를 추가하고 PostgreSQL 구현으로 옮기세요. 현재 메모리 Map은 해당 교체 지점입니다.

닉네임·방 코드·명령은 Zod로 검증하고, 소켓 이벤트별 방 소속과 게임 턴을 확인합니다. 요청 ID는 명령별 중복 방지 키이며, 게임 명령 결과를 플레이어 토큰별로 보관합니다. CORS는 프로덕션에서 같은 출처만 허용하고, JSON/Socket.IO 페이로드 크기를 제한합니다. 계정 정보는 수집하지 않습니다.

## 소켓 이벤트

요청에는 `requestId`와 재접속용 `token`이 포함됩니다. 응답은 `{ok:true,...}` 또는 `{ok:false,error:"ERROR_CODE"}` 형태입니다.

| 이벤트 | 요청 | 권한 및 효과 |
|---|---|---|
| `room:create` | `name` | 새 방 생성, 요청자 방장 |
| `room:join` | `code`, `name` | 빈 자리 참가 또는 같은 토큰의 자리 복구 |
| `room:reconnect` | `code` | 기존 토큰의 자리 연결 복구 |
| `room:state` | `code` | 방 참가자에게 현재 상태 응답 |
| `room:ready` | `code` | 참가자 준비 토글 |
| `room:start` | `code` | 방장만, 2명 이상이고 모두 준비되면 시작 |
| `game:action` | `code`, `action` | 현재 플레이어/단계 확인 후 `roll`, `buy`, `decline`, `build`, `end`, `surrender` 처리 |
| 서버 `room:state` | 상태 스냅샷 | 같은 방의 모든 소켓에 브로드캐스트 |

오류 코드에는 `ROOM_NOT_FOUND`, `ROOM_FULL`, `NAME_TAKEN`, `NOT_A_MEMBER`, `HOST_ONLY`, `PLAYERS_NOT_READY`, `NOT_YOUR_TURN`, `INVALID_PHASE`, `INSUFFICIENT_FUNDS`, `BUILD_NOT_ALLOWED`, `BUILD_EVENLY` 등이 있습니다. 이벤트는 Socket.IO 룸에만 전달해 다른 방 데이터를 분리합니다.

## 저작권

게임명, 보드 데이터, 아트는 이 프로젝트를 위해 만든 독창적인 자료입니다. 기존 보드게임의 상표, 보드 배치, 아트 자산을 사용하지 마세요.
