import React from 'react';
import { PlaceholderScreen } from '../components/PlaceholderScreen';

export function AccountSecurityScreen() {
  return <PlaceholderScreen title="Account & Security" note="Change email/password, biometric toggle, delete-account (NDPR) — Phase 1." />;
}

export function HelpCenterScreen() {
  return <PlaceholderScreen title="Help Center" note="Searchable FAQ, contact/live chat — Phase 1." />;
}

export function PrivacyTermsScreen() {
  return <PlaceholderScreen title="Privacy & Terms" note="NDPR-compliant policy content — Phase 1." />;
}

export function AboutScreen() {
  return <PlaceholderScreen title="About" note="BusinessDay Mobile · v1.0.0 (prototype)" />;
}

export function TodaysPaperScreen() {
  return <PlaceholderScreen title="Today's Paper" note="Editor-curated print-style edition — Phase 2." />;
}
