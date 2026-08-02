# iOS Native App Exploration via Capacitor

## What we are evaluating

Converting the existing React + Vite + TypeScript web app into a real iOS app that can be published on the App Store. We will use Capacitor (by Ionic) because it wraps a web app in a native shell while keeping the current code, styling, and deployment pipeline intact.

## Current state

- Frontend: React 18, TypeScript 5, Vite 5, Tailwind CSS 3, shadcn/ui.
- Routing: `react-router-dom` with BrowserRouter.
- Data & auth: Supabase client (`@supabase/supabase-js`) using localStorage for session persistence.
- Drag-and-drop: `@dnd-kit` for task reordering and calendar scheduling.
- Mobile UI: Already responsive; the navigation bar and calendar week view use mobile-first breakpoints.
- No Capacitor installed yet; no `capacitor.config.ts` exists.

## Capacitor approach

Capacitor embeds the Vite-built app in a native WKWebView and exposes native APIs through JavaScript plugins. The app stays a single codebase, but we gain the ability to:

- Ship through the App Store.
- Use native push notifications.
- Use the iOS share sheet, camera, and biometric authentication.
- Access safe-area insets, haptic feedback, and native navigation gestures.

This is the recommended path for a Lovable/React app rather than rewriting in Swift or using React Native.

## Required setup steps

1. Install Capacitor packages
   - `@capacitor/core`
   - `@capacitor/cli` (dev dependency)
   - `@capacitor/ios`
   - Optionally `@capacitor/android` if you want Android later.

2. Initialize Capacitor
   - Run `npx cap init`.
   - Use `appID: app.lovable.27a35b4926604a20a1c9aedc04b2a7b2`.
   - Use `appName: lightweight-task-manager`.
   - Add the sandbox hot-reload server URL in `capacitor.config.ts` for testing.

3. Add the iOS platform
   - `npx cap add ios`.
   - This creates the `ios/` folder with an Xcode project.

4. Build the web app
   - `npm run build`.
   - `npx cap sync ios` to copy the web bundle into the native project.

5. Open in Xcode
   - `npx cap open ios`.
   - Build and run on a simulator or physical device.

## Development workflow

- For most day-to-day work, we can keep the dev server running inside the simulator using Capacitor's server URL config, so changes in the Vite dev server show instantly without rebuilding.
- When you want to test a production build or ship, run `npm run build && npx cap sync ios`.
- Native code changes require opening the `ios/` project in Xcode.

## UI/UX changes needed for a good iOS app

A native iOS app needs to feel native, not just a web view. The following areas are worth addressing:

- **Touch targets**: Ensure buttons and drag handles are at least 44×44 pt. The current drag handle and navigation buttons are small on some screens.
- **Bottom-sheet navigation**: Consider replacing the top bar with a bottom tab bar for primary views (Overview, Today, Calendar, Manage). This is the standard iOS pattern.
- **Pull-to-refresh**: Add a pull-to-refresh gesture on lists and calendar views to refresh tasks.
- **Swipe actions**: Allow swiping a task to complete or reschedule; currently completion is done via checkboxes inside dialogs.
- **Safe area**: Use `env(safe-area-inset-*)` and the Capacitor safe-area plugin so content avoids the notch and home indicator.
- **Keyboard handling**: Review dialogs and forms to ensure the on-screen keyboard does not obscure inputs.
- **Native gestures**: Disable problematic swipe-to-go-back conflicts with the calendar drag-and-drop if needed.
- **Status bar**: Configure status bar color and style from the native iOS project.

## Native features that would fit the product

Not all of these are required, but they are now possible with Capacitor:

- **Push notifications**: Remind users of tasks due today or overdue.
- **Local notifications**: Remind users at a specific time without a server.
- **iOS share sheet**: Share a task or checklist to other apps.
- **Biometric lock**: Face ID / Touch ID to protect task data.
- **Haptic feedback**: Subtle feedback when completing tasks or dragging.
- **Widgets**: iOS home-screen widget showing today's tasks (requires native Swift extension, more complex).

## Authentication considerations

- The current Supabase client stores session tokens in `localStorage`. This works in a Capacitor WKWebView, but it is less secure than native keychain storage.
- For a production iOS app, consider migrating Supabase session storage to the iOS Keychain using a Capacitor secure-storage plugin or Supabase's native iOS auth flows.
- OAuth sign-in (e.g., Google) needs to be handled through the native OS browser or a plugin; the web-based OAuth flow may not work cleanly in a WKWebView.
- Deep-linking back from OAuth into the app needs to be configured in `Info.plist` and `capacitor.config.ts`.

## Build and App Store requirements

- You need a Mac with Xcode 15+ installed.
- You need an Apple Developer account ($99/year) to publish to the App Store or test on a physical device beyond a few days.
- iOS app review requires:
  - App icon, launch screen, screenshots for multiple device sizes.
  - Privacy manifest (`PrivacyInfo.xcprivacy`) for the data you collect.
  - App Tracking Transparency prompt if you use analytics or advertising (we do not currently, but Supabase analytics may require disclosure).
  - Rejectable-risk content: make sure sign-in/up flows work reliably, no broken web content, no crash on first launch.

## Risks and challenges

- **Drag-and-drop on touch**: `@dnd-kit` supports touch, but reordering tasks in a small list and dragging tasks onto calendar days can feel cramped on iPhone. We may need to redesign or add a long-press activation delay.
- **Calendar week view on iPhone**: A seven-column calendar is very narrow on a phone screen. We may need a different layout for the mobile app (e.g., day view or agenda list) while keeping the week view for iPad/desktop.
- **Offline-first expectation**: iOS users expect apps to work offline. The current app fetches data from Supabase on load and does not cache offline. We would need a cache or offline sync strategy.
- **Performance**: A WKWebView is fast, but complex calendar re-renders or large task lists could drop frames. We should measure and optimize if needed.
- **App Store review**: Web-wrapped apps sometimes get rejected for being "not sufficiently native." We should invest in native-feeling navigation, gestures, and offline behavior to reduce this risk.
- **Ongoing maintenance**: Each iOS release and Xcode update can require small Capacitor/Xcode project changes, and we need to test on real devices before every release.

## Proposed implementation phases

### Phase 1: Foundation (1–2 days)
- Install Capacitor, add iOS platform, configure app ID and hot reload.
- Build and run the current app on an iOS simulator.
- Verify auth, workspace switcher, and core views render correctly.
- Add safe-area and status-bar config.

### Phase 2: Mobile UX polish (2–3 days)
- Review and enlarge touch targets.
- Add pull-to-refresh on task lists.
- Add bottom tab bar or refine the top navigation for one-handed use.
- Test dialogs and forms with the on-screen keyboard.
- Adjust calendar week view for iPhone width.

### Phase 3: Native capabilities (2–3 days)
- Implement push notifications for due/overdue tasks.
- Add haptic feedback on task completion.
- Move Supabase session storage to secure storage if desired.
- Add share-sheet support for tasks.

### Phase 4: App Store readiness (2–3 days)
- Design app icon, splash screen, and App Store screenshots.
- Add privacy manifest and App Tracking Transparency configuration if needed.
- Configure code signing, provisioning profiles, and App Store Connect listing.
- Test on physical devices and submit for review.

## Effort estimate

- **MVP iOS app running in simulator**: 1–2 days.
- **Polished iOS app with native UX**: 1–1.5 weeks.
- **App Store-ready with notifications and secure auth**: 2–3 weeks.
- **Ongoing maintenance per release**: a few hours each cycle.

## Recommendation

Option 2 is feasible and a good fit for this app because the codebase is already a modern React app with a responsive layout. The biggest design decisions are:

1. How native should it feel? A web-view wrapper gets you to the App Store fastest; investing in bottom tabs, swipe actions, and offline support makes it feel like a real iOS app.
2. Which native features are worth the cost? Push notifications and secure storage add meaningful value but also maintenance.

If you want to move forward, we should start with Phase 1 to get the app running on an iOS simulator, then decide which UX and native features to add based on what we see.
