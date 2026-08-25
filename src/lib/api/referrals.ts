import { apiRequest } from './client';

export type ReferralCode = { id: string; code: string; createdAt: string };

export type ReferralRedemption = {
  id: string;
  referralCodeId: string;
  redeemedByUserId: string;
  rewardCouponCode: string;
  createdAt: string;
};

// Lazily created on first call — most readers never open this screen.
export function getMyReferralCode(): Promise<ReferralCode> {
  return apiRequest('/api/v1/me/referrals/code');
}

export function getMyReferrals(): Promise<ReferralRedemption[]> {
  return apiRequest('/api/v1/me/referrals');
}
