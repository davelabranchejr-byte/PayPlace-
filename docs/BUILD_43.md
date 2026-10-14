# PayPlace 1.0.0 (43) — release candidate

Includes the tested October 14 privacy/data-controls update and six-tab Plaid Banking redesign on top of Build 42.

- Bobbie’s banking demo is the first feature on welcome and Home. Public username Bobbie; password litterbox.
- Main tabs: Home, Plaid Banking, Budget, Bills, Debt, Neighborhood.
- Budget holds the payday calculation, extra-paycheck calendar and savings goals.
- Bills holds payment corrections/history and Subscription Detective. Credit editing lives beside its Banking dashboard.
- Neighborhood holds character visits, Em’s Pet Spa, Calm Garden, Quiet Mode and overwhelmed support.
- The fictional demo remains separate from personal finances. No real transfers, bill payments or credit reports.
- Restored public policy/support links and email-confirmed account/data deletion; provider service is already deployed.

Validation: 113 app tests passed, source checks passed and iOS/Android/web exports succeeded before upload. CI repeats source checks and tests before signing. Exact signed IPA and physical-device visual checks are separate validation steps.

Build command: existing release-ios-expo.yml workflow, release/em-spa-next-build, validate_only=false, signing_only=true, build_number=43. This archives with Xcode 26 and submits the signed IPA through Expo using existing saved repository credentials. Documenting the command is not proof it completed; verify the workflow’s signing and Expo submission result.
