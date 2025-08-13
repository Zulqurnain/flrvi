# FLRVI - Mobile App Architecture (React Native)

**Objective:** This document outlines the proposed architecture for the FLRVI mobile application, which will be built using React Native and TypeScript.

### 1. Technology Stack

*   **Framework:** React Native
*   **Language:** TypeScript
*   **State Management:** Redux Toolkit
*   **API Communication:** Axios
*   **Navigation:** React Navigation
*   **Styling:** Styled Components

### 2. Folder Structure

To ensure the project is scalable and maintainable, we will follow a structured folder organization:

```
/src
|-- /api         // API-related logic (Axios instances, API calls)
|-- /assets      // Images, fonts, and other static assets
|-- /components  // Reusable UI components (buttons, inputs, cards)
|-- /config      // App-wide configuration (constants, theme)
|-- /hooks       // Custom React hooks
|-- /navigation  // Navigation stacks and routes (React Navigation)
|-- /screens     // Main screens of the app (e.g., Login, Profile, Home)
|-- /store       // Redux Toolkit store, slices, and selectors
|-- /styles      // Global styles and theme definitions
|-- /utils       // Utility functions and helpers
```

### 3. State Management (Redux Toolkit)

We will use Redux Toolkit for a centralized and predictable state management solution.

*   **Store:** A single, global store will hold the entire state of the application.
*   **Slices:** The state will be divided into "slices," each corresponding to a specific feature (e.g., `userSlice`, `profileSlice`, `chatSlice`).
*   **Actions & Reducers:** Each slice will contain its own actions and reducers, making the logic modular and easy to manage.
*   **Async Logic:** Asynchronous operations, such as fetching data from our backend, will be handled using `createAsyncThunk`.

**Example `userSlice`:**
```typescript
// src/store/slices/userSlice.ts

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../api/client';

export const loginUser = createAsyncThunk('user/login', async (credentials) => {
  const response = await apiClient.post('/users/login', credentials);
  return response.data;
});

const userSlice = createSlice({
  name: 'user',
  initialState: {
    token: null,
    status: 'idle',
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.token = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.token = action.payload.token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export const { logout } = userSlice.actions;
export default userSlice.reducer;
```

### 4. Navigation (React Navigation)

We will use React Navigation to manage the app's screen flows.

*   **Stack Navigators:** We will use stack navigators for linear flows, such as the onboarding process (Welcome -> Register -> Create Profile).
*   **Tab Navigator:** A tab navigator will be used for the main app interface, with tabs for "Home," "Search," "Messages," and "Profile."
*   **Authentication Flow:** The app will have a conditional navigation flow. If the user is not authenticated (i.e., no token in the Redux store), they will be shown the authentication stack. Otherwise, they will be directed to the main app.

### 5. Component-Based UI

The UI will be built using a component-based approach, emphasizing reusability.

*   **Atomic Design Principles:** We will loosely follow atomic design principles, creating small, reusable components (`atoms`, e.g., `Button`, `Input`) that can be composed into larger components (`molecules`, e.g., `ProfileCard`) and full screens (`organisms`).
*   **Styled Components:** We will use Styled Components for styling, which allows for a clean separation of styles and logic and supports theming.

This architecture will provide a solid, scalable, and maintainable foundation for the FLRVI mobile app.
