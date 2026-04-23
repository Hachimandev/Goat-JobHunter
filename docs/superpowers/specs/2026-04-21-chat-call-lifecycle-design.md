# Chat Call Lifecycle Implementation Design

## Goal

Complete backend call lifecycle support for chat rooms with persistent sessions, signaling events, and call-state APIs, building on the already completed Agora token-generation foundation.

## Scope

### In Scope

- Persist call sessions and participants in PostgreSQL.
- Enforce chat-room scoped call lifecycle rules in service layer.
- Provide lifecycle APIs: start, join, leave, end, current-state.
- Bind token generation to active call session context.
- Emit realtime call events to chat room topic.
- Add focused tests for token + lifecycle service behavior.

### Out of Scope

- Cloud recording/transcription.
- Mobile push notifications.
- Billing/analytics/reporting.
- Frontend implementation.

## Architecture

- Data model:
  - `chat_call_sessions` tracks one call timeline per room occurrence.
  - `chat_call_participants` tracks member presence and publisher intent.
- Service orchestration:
  - `ChatCallService` controls transitions and validates room membership.
  - `AgoraRtcTokenService` verifies active session before issuing token.
- Realtime:
  - Lifecycle events are published to `/topic/chatrooms/{chatRoomId}/calls`.

## API Surface

- `POST /api/v1/chatrooms/{chatRoomId}/calls`
- `POST /api/v1/chatrooms/{chatRoomId}/calls/{sessionId}/join`
- `POST /api/v1/chatrooms/{chatRoomId}/calls/{sessionId}/leave`
- `POST /api/v1/chatrooms/{chatRoomId}/calls/{sessionId}/end`
- `GET /api/v1/chatrooms/{chatRoomId}/calls/current`
- Existing token endpoint remains: `POST /api/v1/chatrooms/{chatRoomId}/calls/token` (extended with optional `sessionId`).

## Data Contract Highlights

- Session status: `PENDING`, `ACTIVE`, `ENDED`, `CANCELLED`.
- End reason: `HANGUP`, `NO_ANSWER`, `TIMEOUT`, `REMOVED`, `NETWORK_ERROR`.
- Session response includes session metadata and participant list.

## Validation and Safety Rules

- Caller must belong to chat room.
- Session must belong to room.
- Token can only be issued for active/pending session in room.
- Leave/end operations are idempotent when possible.
- A room cannot have more than one active/pending call session at once (enforced in service logic).

## Done Criteria

- Liquibase migration created and linked in changelog master.
- New entities/repositories compile and map correctly.
- Lifecycle endpoints and service behavior implemented.
- Token issuance bound to active session context.
- Realtime call events emitted.
- Added tests for lifecycle and token integration logic.
