# FLRVI - Analytics & Telemetry Plan

**Version:** 1.0
**Date:** 2025-08-09

**Objective:** This document defines the analytics and telemetry strategy for the FLRVI application. It specifies the key user events and properties we will track to measure our success metrics and inform product decisions.

### 1. Analytics Platform

*   **Primary Tool:** Firebase Analytics
*   **Reasoning:** Firebase provides a comprehensive, free suite of tools for event tracking, user segmentation, funnel analysis, and crash reporting. It integrates seamlessly with both React Native and our backend.

### 2. Key Funnels to Track

We will define several key funnels in Firebase to monitor user progression through critical flows.

1.  **Onboarding Funnel:**
    *   `screen_view: WelcomeScreen`
    *   `event: register_button_press`
    *   `event: registration_success`
    *   `event: profile_wizard_complete`
    *   **Goal:** To identify drop-off points during the sign-up process.

2.  **Monetization Funnel:**
    *   `event: premium_feature_attempt` (e.g., trying to send a second message)
    *   `screen_view: SubscriptionScreen`
    *   `event: subscribe_button_press`
    *   `event: subscription_purchase_success`
    *   **Goal:** To measure the effectiveness of our paywalls and the conversion rate to premium.

### 3. Event Dictionary

This section defines the specific events and their associated parameters that we will track.

#### 3.1. User Authentication Events
*   **`event: registration_success`**
    *   **Description:** Fired when a user successfully creates a new account.
    *   **Parameters:** `method` (e.g., 'email')
*   **`event: login_success`**
    *   **Description:** Fired when a user successfully logs in.
    *   **Parameters:** `method` (e.g., 'email')

#### 3.2. Core Engagement Events
*   **`event: profile_like`**
    *   **Description:** Fired when a user likes another user's profile.
    *   **Parameters:** `source_screen` (e.g., 'discover_feed', 'profile_view')
*   **`event: match_created`**
    *   **Description:** Fired when a mutual like results in a new match.
*   **`event: message_sent`**
    *   **Description:** Fired when a user sends a message.
    *   **Parameters:** `message_type` ('text' or 'voice_note'), `is_first_message` (boolean)

#### 3.3. Monetization Events
*   **`event: subscription_purchase_success`**
    *   **Description:** Fired upon a successful premium subscription purchase.
    *   **Parameters:** `plan_id` (e.g., 'monthly_299'), `price` (e.g., 299), `currency` ('THB')
*   **`event: boost_purchase_success`**
    *   **Description:** Fired upon a successful "Boost" purchase.
    *   **Parameters:** `product_id` ('boost_50_thb'), `price` (50), `currency` ('THB')

#### 3.4. Feature Usage Events
*   **`event: search_filters_applied`**
    *   **Description:** Fired when a user applies filters on the discover screen.
    *   **Parameters:** `filters_used` (e.g., 'age,gender,location')
*   **`event: profile_verification_started`**
    *   **Description:** Fired when a user starts the profile verification process.

### 4. User Properties

We will set the following user properties in Firebase to allow for powerful segmentation of our user base.

*   **`user_id`**: The user's unique ID from our database.
*   **`is_premium`**: `true` or `false`.
*   **`gender`**: `Man`, `Woman`, or `Other`.
*   **`age`**: The user's age.
*   **`location`**: The user's city/province.

This detailed analytics plan will provide us with the insights needed to understand our users, measure our success, and build a better product over time.
