import { CallTypeEnum, CallStatusEnum, CallEndReasonEnum } from '../../types/enum';
import type { CallParticipant, CallRtcCredentials, CallSession, CallTokenResponse } from '../../types/model';

describe('CallTypeEnum', () => {
  it('should have VOICE value', () => {
    expect(CallTypeEnum.VOICE).toBe('VOICE');
  });

  it('should have VIDEO value', () => {
    expect(CallTypeEnum.VIDEO).toBe('VIDEO');
  });
});

describe('CallTypeEnum exhaustiveness', () => {
  it('has exactly 2 values', () => {
    expect(Object.keys(CallTypeEnum)).toHaveLength(2);
  });
});

describe('CallStatusEnum', () => {
  it('should have PENDING value', () => {
    expect(CallStatusEnum.PENDING).toBe('PENDING');
  });

  it('should have ACTIVE value', () => {
    expect(CallStatusEnum.ACTIVE).toBe('ACTIVE');
  });

  it('should have ENDED value', () => {
    expect(CallStatusEnum.ENDED).toBe('ENDED');
  });

  it('should have CANCELLED value', () => {
    expect(CallStatusEnum.CANCELLED).toBe('CANCELLED');
  });
});

describe('CallStatusEnum exhaustiveness', () => {
  it('has exactly 4 values', () => {
    expect(Object.keys(CallStatusEnum)).toHaveLength(4);
  });
});

describe('CallEndReasonEnum', () => {
  it('should have HANGUP value', () => {
    expect(CallEndReasonEnum.HANGUP).toBe('HANGUP');
  });

  it('should have NO_ANSWER value', () => {
    expect(CallEndReasonEnum.NO_ANSWER).toBe('NO_ANSWER');
  });

  it('should have TIMEOUT value', () => {
    expect(CallEndReasonEnum.TIMEOUT).toBe('TIMEOUT');
  });

  it('should have REMOVED value', () => {
    expect(CallEndReasonEnum.REMOVED).toBe('REMOVED');
  });

  it('should have NETWORK_ERROR value', () => {
    expect(CallEndReasonEnum.NETWORK_ERROR).toBe('NETWORK_ERROR');
  });
});

describe('CallEndReasonEnum exhaustiveness', () => {
  it('has exactly 5 values', () => {
    expect(Object.keys(CallEndReasonEnum)).toHaveLength(5);
  });
});

describe('Call types', () => {
  it('should allow creating a valid CallParticipant object', () => {
    const participant: CallParticipant = {
      account: {
        accountId: 1,
        avatar: null,
        username: 'testuser',
        fullName: 'Test User',
        email: 'test@example.com',
      },
      publisher: true,
      joinedAt: '2024-01-01T00:00:00Z',
      leftAt: null,
    };
    expect(participant.account.accountId).toBe(1);
    expect(participant.publisher).toBe(true);
  });

  it('should allow creating a valid CallRtcCredentials object', () => {
    const rtc: CallRtcCredentials = {
      sessionId: 1,
      appId: 'app123',
      channelName: 'channel1',
      token: 'token123',
      uid: 100,
      expiresAtEpochMs: 1700000000000,
      ttlSeconds: 3600,
      publisher: true,
    };
    expect(rtc.sessionId).toBe(1);
    expect(rtc.appId).toBe('app123');
  });

  it('should allow creating a valid CallSession object', () => {
    const session: CallSession = {
      sessionId: 1,
      chatRoomId: 10,
      status: CallStatusEnum.ACTIVE,
      agoraChannelName: 'agora1',
      initiatorAccountId: 1,
      startedAt: '2024-01-01T00:00:00Z',
      participants: [],
      callType: CallTypeEnum.VOICE,
    };
    expect(session.sessionId).toBe(1);
    expect(session.status).toBe('ACTIVE');
  });

  it('should allow creating a valid CallTokenResponse object', () => {
    const tokenResponse: CallTokenResponse = {
      sessionId: 1,
      appId: 'app123',
      channelName: 'channel1',
      uid: 100,
      token: 'token123',
      expiresAtEpochMs: 1700000000000,
      ttlSeconds: 3600,
      publisher: true,
    };
    expect(tokenResponse.sessionId).toBe(1);
    expect(tokenResponse.token).toBe('token123');
  });
});

describe('CallSession optional fields', () => {
  it('is valid without optional fields', () => {
    const minimalSession: CallSession = {
      sessionId: 1,
      chatRoomId: 1,
      status: CallStatusEnum.ACTIVE,
      agoraChannelName: 'chatroom-1',
      initiatorAccountId: 1,
      startedAt: '2026-01-01T00:00:00Z',
      participants: [],
    };
    expect(minimalSession.sessionId).toBe(1);
    expect(minimalSession.endedAt).toBeUndefined();
    expect(minimalSession.endReason).toBeUndefined();
    expect(minimalSession.callType).toBeUndefined();
    expect(minimalSession.rtc).toBeUndefined();
  });
});

describe('CallParticipant optional fields', () => {
  it('is valid without leftAt', () => {
    const activeParticipant: CallParticipant = {
      account: {
        accountId: 1,
        username: 'user1',
        fullName: 'User One',
        email: 'user@test.com',
      },
      publisher: true,
      joinedAt: '2026-01-01T00:00:00Z',
    };
    expect(activeParticipant.leftAt).toBeUndefined();
  });
});
