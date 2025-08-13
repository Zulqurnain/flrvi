# FLRVI - API Versioning Strategy

**Objective:** This document defines the strategy for versioning the FLRVI API. A clear versioning strategy is essential for allowing the backend to evolve without breaking older versions of the mobile application that are still in use by our users.

### 1. Versioning Scheme

We will use **URL-based versioning**. The API version will be included in the URL path, like so:

`/api/v1/profile`
`/api/v2/profile`

This is a clear and explicit way to specify the version of the API that the client is targeting.

### 2. When to Create a New Version

A new API version (e.g., `v2`) will only be created when a **breaking change** is introduced. A breaking change is any change that would cause an existing client application to fail. Examples include:

*   Removing a field from an API response.
*   Renaming a field in an API response.
*   Changing the data type of a field.
*   Removing an API endpoint.
*   Adding a new required field to a request body.

**Non-breaking changes** can be made to the existing API version without requiring a version bump. Examples include:

*   Adding a new, optional field to an API response.
*   Adding a new, optional field to a request body.
*   Adding a new API endpoint.

### 3. Implementation Strategy

*   **Code Organization:** When a new version is created, we will create a new set of route and controller files for that version to keep the code organized. For example:
    ```
    /routes
    |-- /v1
    |   |-- profile.js
    |   |-- users.js
    |-- /v2
    |   |-- profile.js
    ```
*   **Default Version:** The latest, most stable version of the API will be considered the default.
*   **Deprecation Policy:** When a new API version is released, the previous version will be considered **deprecated**. We will support a deprecated version for a minimum of **6 months** to give users time to update their applications. We will monitor the usage of older API versions and communicate clearly with our users before decommissioning a deprecated version.

### 4. Client-Side Handling

*   The mobile application will store the API base URL (e.g., `https://api.flrvi.com/api/v1`) in a configuration file.
*   When making API requests, the app will use this base URL.
*   This makes it easy to update the app to a new API version by simply changing the configuration.
*   The app should also be designed to handle API errors gracefully, including notifying the user if their app version is too old and needs to be updated.

This API versioning strategy will allow us to continuously improve and evolve the FLRVI platform while providing a stable and reliable experience for our users.
