# FLRVI - Push Notification & Deep Linking Strategy

**Objective:** This document outlines the strategy for using push notifications to engage users and the deep linking architecture that will ensure a seamless user experience.

### 1. Push Notification Strategy

Push notifications are a powerful tool for user engagement and retention. Our strategy will be:

*   **Value-Driven:** Every notification must provide clear value to the user.
*   **Personalized:** Notifications should be personalized to the user's activity and preferences.
*   **Actionable:** Notifications should encourage the user to take a specific action within the app.
*   **Respectful:** We will not spam users. Users will have full control over their notification preferences.

**Key Notification Types:**
1.  **New Message:**
    *   **Trigger:** User receives a new message.
    *   **Content:** "You have a new message from [User Name]."
    *   **Deep Link:** Opens directly to the chat screen with that user.
2.  **New Like:**
    *   **Trigger:** A user's profile is liked by another user.
    *   **Content:** "[User Name] likes you! Find out who."
    *   **Deep Link:** Opens to the "Who Likes You" screen (if premium) or the subscription page (if not).
3.  **New Match:**
    *   **Trigger:** Two users mutually like each other.
    *   **Content:** "It's a match! You and [User Name] like each other."
    *   **Deep Link:** Opens to the chat screen with the matched user.
4.  **Re-engagement:**
    *   **Trigger:** A user has been inactive for a period of time (e.g., 3 days).
    *   **Content:** "Your next connection could be waiting. Come back and see who's new!"
    *   **Deep Link:** Opens to the main "Discover" (Home) screen.

### 2. Deep Linking Architecture

Deep linking allows us to navigate the user to a specific screen within the app from an external source (like a push notification or a web link).

*   **URL Scheme:** We will define a custom URL scheme for the app (e.g., `flrvi://`).
*   **Route Structure:** The deep link URLs will correspond to the app's navigation structure.
    *   `flrvi://user/{userId}` -> Opens the profile screen for the specified user.
    *   `flrvi://chat/{conversationId}` -> Opens the chat screen for the specified conversation.
    *   `flrvi://settings/notifications` -> Opens the notification settings screen.
*   **Implementation (React Navigation):** We will use React Navigation's built-in deep linking capabilities to configure the URL scheme and map the routes to the correct screens.
*   **Web Integration:** We will also configure Universal Links (iOS) and App Links (Android) to allow seamless navigation from the `flrvi.com` website to the app.

This strategy will ensure that our push notifications are effective and that users have a smooth, context-aware experience when interacting with them.
