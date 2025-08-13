# FLRVI - Project Documentation Hub

**Objective:** This document is the central hub for all documentation related to the FLRVI project. It provides a structured overview and links to all strategic, technical, and design documents.

---

## **1. Master Project Guide**

This is the single source of truth that consolidates all high-level information about the project.

*   **[The Definitive Product Requirements Document (PRD)](./prd.md)**
    *   **Purpose:** A comprehensive, all-in-one guide covering the project's vision, strategy, features, technical specifications, and operational plans.

---

## **2. Strategic & Operational Documents**

These documents provide in-depth details on the business, marketing, and operational aspects of the project.

*   **[Competitive Analysis](./competitive_analysis.md):** A detailed analysis of the Thai dating app market and FLRVI's strategic position.
*   **[Monetization Strategy](./monetization_strategy.md):** A plan for the app's revenue model, including pricing and feature gating.
*   **[Go-to-Market & Launch Plan](./launch_plan.md):** A strategic plan for launching the app and acquiring users.
*   **[Content Strategy Guide](./content_strategy.md):** Guidelines for the app's tone of voice and content moderation policies.

---

## **3. Technical & Architectural Documents**

These documents define the technical foundation of the FLRVI platform.

*   **[Technical Architecture Overview](./technical_architecture.md):** A detailed look at the backend architecture, data flows, and core algorithms.
*   **[Mobile App Architecture (React Native)](./mobile_app_architecture.md):** The architectural plan for the mobile app, including state management and folder structure.
*   **[API Versioning Strategy](./api_versioning_strategy.md):** The strategy for managing and evolving the backend API.
*   **[Security Best Practices](./security_best_practices.md):** A comprehensive guide to the security measures for the platform.
*   **[Scalability Plan](./scalability_plan.md):** A plan for ensuring the application can handle significant user growth.
*   **[Testing Strategy](./testing_strategy.md):** A multi-layered strategy for ensuring application quality.

---

## **4. Hyper-Detailed Screen & Component Definitions (JSON)**

These JSON files provide a granular, component-level definition for every screen, page, and reusable component in the application.

### **4.1. Mobile App Screens (`/app_screens_json`)**
*   **Onboarding:**
    *   [01_welcome_screen.json](./app_screens_json/01_welcome_screen.json)
    *   [02_register_screen.json](./app_screens_json/02_register_screen.json)
    *   [03_login_screen.json](./app_screens_json/03_login_screen.json)
    *   [09_profile_creation_wizard_screen.json](./app_screens_json/09_profile_creation_wizard_screen.json)
    *   [20_forgot_password_screen.json](./app_screens_json/20_forgot_password_screen.json)
    *   [24_password_reset_sent_screen.json](./app_screens_json/24_password_reset_sent_screen.json)
*   **Core App:**
    *   [04_home_screen.json](./app_screens_json/04_home_screen.json)
    *   [05_profile_screen.json](./app_screens_json/05_profile_screen.json)
    *   [15_my_profile_screen.json](./app_screens_json/15_my_profile_screen.json)
    *   [12_edit_profile_screen.json](./app_screens_json/12_edit_profile_screen.json)
    *   [06_messages_screen.json](./app_screens_json/06_messages_screen.json)
    *   [07_chat_screen.json](./app_screens_json/07_chat_screen.json)
*   **Features & Settings:**
    *   [10_filter_modal.json](./app_screens_json/10_filter_modal.json)
    *   [11_subscription_screen.json](./app_screens_json/11_subscription_screen.json)
    *   [16_manage_subscription_screen.json](./app_screens_json/16_manage_subscription_screen.json)
    *   [17_who_likes_you_screen.json](./app_screens_json/17_who_likes_you_screen.json)
    *   [23_boost_purchase_screen.json](./app_screens_json/23_boost_purchase_screen.json)
    *   [08_settings_screen.json](./app_screens_json/08_settings_screen.json)
    *   [13_notification_settings_screen.json](./app_screens_json/13_notification_settings_screen.json)
    *   [14_language_settings_screen.json](./app_screens_json/14_language_settings_screen.json)
*   **Safety & Legal:**
    *   [21_profile_verification_screen.json](./app_screens_json/21_profile_verification_screen.json)
    *   [22_user_reporting_flow.json](./app_screens_json/22_user_reporting_flow.json)
    *   [18_terms_of_service_screen.json](./app_screens_json/18_terms_of_service_screen.json)
    *   [19_privacy_policy_screen.json](./app_screens_json/19_privacy_policy_screen.json)
*   **System States:**
    *   [25_empty_states.json](./app_screens_json/25_empty_states.json)

### **4.2. Web Pages (`/web_screens_json`)**
*   [01_landing_page.json](./web_screens_json/01_landing_page.json)
*   [02_admin_login_page.json](./web_screens_json/02_admin_login_page.json)
*   [03_admin_dashboard_page.json](./web_screens_json/03_admin_dashboard_page.json)

### **4.3. Reusable Components (`/components_json`)**
*   [profile_card.json](./components_json/profile_card.json)
*   [primary_button.json](./components_json/primary_button.json)
*   [text_input.json](./components_json/text_input.json)
