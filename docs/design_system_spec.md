# FLRVI - Design System Specification

**Version:** 1.0
**Date:** 2025-08-09

**Objective:** This document provides a detailed specification for the FLRVI Design System. It serves as the single source of truth for all UI components, design tokens, and visual styles, ensuring a consistent and high-quality user experience.

---

## **1. Design Tokens**

Design tokens are the atomic values of our design system, representing the foundational elements of our visual language.

### **1.1. Colors**
*   **Primary:** `#E91E63` (Pink)
*   **Secondary:** `#FF9800` (Orange)
*   **Text:**
    *   `text.primary`: `#333333`
    *   `text.secondary`: `#757575`
*   **Background:**
    *   `bg.default`: `#FFFFFF`
    *   `bg.subtle`: `#F5F5F5`
*   **System:**
    *   `system.success`: `#4CAF50`
    *   `system.error`: `#F44336`

### **1.2. Typography**
*   **Font Family:** `Poppins`
*   **Font Sizes (scale):**
    *   `xs`: 12pt
    *   `sm`: 14pt
    *   `md`: 16pt
    *   `lg`: 20pt
    *   `xl`: 24pt
*   **Font Weights:**
    *   `light`: 300
    *   `regular`: 400
    *   `medium`: 500
    *   `semibold`: 600
    *   `bold`: 700

### **1.3. Spacing**
*   **Base Unit:** 4px
*   **Spacing Scale:**
    *   `spacing.xs`: 4px (1x)
    *   `spacing.sm`: 8px (2x)
    *   `spacing.md`: 16px (4x)
    *   `spacing.lg`: 24px (6x)
    *   `spacing.xl`: 32px (8x)

### **1.4. Border Radius**
*   `radius.sm`: 4px
*   `radius.md`: 8px
*   `radius.lg`: 12px
*   `radius.full`: 9999px (for circular elements)

---

## **2. Component Library**

This section provides an overview of our core reusable components. For hyper-detailed specifications of each component's props, styles, and states, please refer to the JSON files in the `docs/components_json/` directory.

### **2.1. Atoms**
*   **Buttons:**
    *   **[Primary Button](./components_json/primary_button.json):** For the main call-to-action on a screen.
    *   **Secondary Button:** For secondary actions.
    *   **Text Button:** For low-emphasis actions.
*   **Inputs:**
    *   **[Text Input](./components_json/text_input.json):** For form fields.
*   **Icons:** Based on Material Design Icons, 24x24px.

### **2.2. Molecules**
*   **[Profile Card](./components_json/profile_card.json):** A card displaying a user's summary.
*   **[Conversation List Item](./components_json/conversation_list_item.json):** An item for displaying a single conversation.
*   **[Message Bubble](./components_json/message_bubble.json):** A component for displaying a single chat message.
*   **[Header](./components_json/header.json):** The standard screen header.

### **2.3. Organisms**
*   **User Grid:** A list of `ProfileCard` components.
*   **Conversation List:** A list of `ConversationListItem` components.
*   **Chat Feed:** A list of `MessageBubble` components.

---

## **3. Iconography**

*   **Library:** Material Design Icons
*   **Usage:** Icons should be used to enhance clarity and provide visual cues, not as decoration. Every icon must have an accessibility label.

---

## **4. Implementation**

*   **React Native:** The design system will be implemented as a library of reusable React Native components.
*   **Styled Components:** We will use Styled Components with its `ThemeProvider` to make the design tokens available to all components.
*   **Storybook:** We will use Storybook to develop, document, and test our UI components in isolation.

This Design System Specification will ensure that we build a consistent, beautiful, and maintainable application.
