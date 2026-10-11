# PayPlace Premium Resilience Hub wiring

Premium opens through `PayPlaceApp` → `HomeScreen` → `NeighborhoodWelcome`.
Pass `onPremium` through both child components; an unbound callback crashes Home
as soon as the returning neighbor unlocks the app.

`premiumVisible` controls the mounted hub. Only mount `PremiumResilienceHub`
while it is open. Close Premium before opening BankConnections or
SubscriptionDetective so two native sheets are not presented together.

Store Premium settings at `finance.premiumResilience` and normalize with
`normalizePremiumState`. The existing encrypted finance vault, backup and
restore paths carry that state. Older saved plans receive defaults without
replacing their bills, debts or onboarding profile.

Use `finance.nextPaycheck` for estimated income. Exclude bills marked paid by
either `paid` or `status`; infer overdue dates from `dueDate` or `due`.
Expected income is not available for a payment now. Recovery planning does
not move money, change account balances, or mark bills paid.

Premium is a free beta preview. Automatic transfers, bank monitoring and
credit reports remain upcoming features until their provider integrations
are active. Keep those limitations visible to testers.

Run `npm run check`, `npm test`, and production Expo exports before releasing.
The launch regression renders the actual app with mocked device services,
checks cancellation/background authentication, visits every main tab, opens
all Premium panels and both linked sheets, and reopens saved Premium state.
Native Face ID and TestFlight behavior still require checking on an iPhone.
