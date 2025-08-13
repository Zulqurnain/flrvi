# FLRVI - Web Application Architecture

**Objective:** This document outlines the proposed architecture for the FLRVI web application (`flrvi.com`), which will serve as the primary marketing site and a web-based portal for users.

### 1. Technology Stack

*   **Framework:** Next.js (React)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS
*   **State Management:** Redux Toolkit (for logged-in user states)
*   **API Communication:** Axios

### 2. Key Architectural Decisions

*   **Server-Side Rendering (SSR) & Static Site Generation (SSG):** We will use Next.js to leverage both SSR and SSG.
    *   **SSG:** Public-facing pages like the homepage, about page, and legal pages will be statically generated for maximum performance and SEO.
    *   **SSR:** Pages that require user authentication (e.g., the user's dashboard) will be server-side rendered to ensure that the user's data is fresh on every request.
*   **Responsive Design:** The web application will be fully responsive, providing an excellent user experience on all devices, from mobile phones to desktops.
*   **Component-Based UI:** We will follow the same component-based principles as the mobile app, creating a library of reusable React components.

### 3. Folder Structure (Next.js App Router)

```
/web
|-- /app
|   |-- /api         // API routes (for server-side actions)
|   |-- /(public)
|   |   |-- /page.tsx      // Homepage
|   |   |-- /about
|   |   |-- /terms
|   |-- /(auth)
|   |   |-- /login
|   |   |-- /signup
|   |-- /(private)
|   |   |-- /dashboard
|   |   |-- /profile
|-- /components  // Reusable React components
|-- /lib         // Utility functions, API client
|-- /store       // Redux Toolkit store and slices
```

### 4. User Authentication Flow (Web)

*   **JWT in Cookies:** Unlike the mobile app, which will use header-based authentication, the web application will store the JWT in a secure, HTTP-only cookie. This is a best practice for web security, as it prevents XSS attacks from accessing the token.
*   **Server-Side Authentication:** For server-side rendered pages, the backend will read the JWT from the cookie to authenticate the user and fetch their data before rendering the page.

### 5. Admin Panel Integration

*   The Admin Panel will remain a separate, simple HTML/CSS/JS single-page application as previously designed. This keeps it decoupled from the main marketing and user-facing website, which is a good security practice.

This architecture ensures that the FLRVI web application will be fast, secure, SEO-friendly, and scalable, providing a seamless experience that complements the mobile apps.
