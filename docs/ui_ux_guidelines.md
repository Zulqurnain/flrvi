# FLRVI - UI/UX Guidelines

**Objective:** This document provides a comprehensive set of UI/UX guidelines for the FLRVI application. Its purpose is to ensure a consistent, accessible, and high-quality user experience across the entire platform.

### 1. Design Philosophy

*   **Modern & Clean:** The design should feel fresh, modern, and uncluttered. We will use ample white space to create a breathable and inviting interface.
*   **User-Centric:** Every design decision should be made with the user in mind. The app should be intuitive and easy to navigate.
*   **Engaging & Fun:** While clean, the design should also be engaging. We will use our brand colors and subtle animations to create a delightful user experience.

### 2. Color Palette

The color palette is based on the brand colors: pink (primary) and orange (secondary).

*   **Primary:** `#E91E63` (Pink) - Used for primary buttons, active states, and key calls-to-action.
*   **Secondary:** `#FF9800` (Orange) - Used for accents, highlights, and secondary actions.
*   **Grayscale:**
    *   `#333333` (Dark Gray) - For body text.
    *   `#757575` (Medium Gray) - For subheadings and secondary text.
    *   `#BDBDBD` (Light Gray) - For borders and dividers.
    *   `#F5F5F5` (Background Gray) - For screen backgrounds.
*   **System Colors:**
    *   `#4CAF50` (Success Green) - For success messages and notifications.
    *   `#F44336` (Error Red) - For error messages and destructive actions.

### 3. Typography

We will use the `Poppins` font for a modern and friendly feel.

*   **Headings (H1, H2):** `Poppins Bold`, 24pt (H1), 20pt (H2).
*   **Subheadings:** `Poppins SemiBold`, 16pt.
*   **Body Text:** `Poppins Regular`, 14pt.
*   **Button Text:** `Poppins Medium`, 16pt.
*   **Captions & Small Text:** `Poppins Light`, 12pt.

### 4. Iconography

*   **Style:** We will use a consistent set of modern, filled icons. The `Material Design Icons` library is recommended.
*   **Size:** Icons should be 24x24 pixels for clarity and touch-friendliness.
*   **Color:** Icons should use the primary or medium gray colors, depending on the context.

### 5. Core UI Components

This section defines the standard appearance and behavior of our reusable UI components.

*   **Buttons:**
    *   **Primary Button:** Solid pink background (`#E91E63`) with white text. Should have a subtle shadow and a slightly darker shade on press.
    *   **Secondary Button:** White background with a pink border and pink text.
    *   **Text Button:** No background or border, just colored text.
*   **Input Fields:**
    *   Should have a light gray border (`#BDBDBD`) and a placeholder text.
    *   On focus, the border should turn pink.
    *   Should include clear labels and error message states.
*   **Profile Cards:**
    *   Should display a user's primary photo, name, age, and location.
    *   Should have a subtle shadow to create depth.
    *   An "online" indicator (a small green dot) should be present if the user is active.
*   **Navigation Bar (Tabs):**
    *   A bottom tab bar with icons and labels for "Home," "Search," "Messages," and "Profile."
    *   The active tab should be highlighted in the primary pink color.

### 6. Accessibility (A11y)

*   **Color Contrast:** All text should have a minimum contrast ratio of 4.5:1 against its background to ensure readability.
*   **Touch Targets:** All interactive elements (buttons, icons) must have a minimum touch target size of 44x44 pixels.
*   **Screen Reader Support:** All images and icons should have descriptive `alt` text or `accessibilityLabel`s for screen readers.

By adhering to these guidelines, we will create a beautiful, consistent, and user-friendly application that stands out in the market.
