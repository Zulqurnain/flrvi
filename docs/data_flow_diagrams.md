# FLRVI - Data Flow Diagrams (DFDs)

**Objective:** This document provides detailed diagrams illustrating how data flows through the FLRVI system for key user actions. It is intended to give developers a clear, end-to-end understanding of the system's logic.

---

## 1. User Registration Data Flow

**Description:** This diagram illustrates the sequence of events and data transformations that occur when a new user registers for an account.

**Flowchart:**
```mermaid
sequenceDiagram
    participant User
    participant MobileApp as FLRVI Mobile App
    participant BackendAPI as Backend API (/api/v1)
    participant UserController as User Controller
    participant UserModel as User Model
    participant Database as MongoDB

    User->>MobileApp: Enters Name, Email, Password
    MobileApp->>MobileApp: Validate input fields (client-side)
    alt Input Invalid
        MobileApp-->>User: Show validation error
    else Input Valid
        MobileApp->>BackendAPI: POST /users/register with (name, email, password)
        BackendAPI->>UserController: registerUser(req, res)
        UserController->>UserModel: findOne({ email: email })
        UserModel->>Database: Query for existing user
        Database-->>UserModel: Return result
        UserModel-->>UserController: User document or null
        
        alt User Already Exists
            UserController-->>BackendAPI: 400 Bad Request with error message
            BackendAPI-->>MobileApp: 400 Response
            MobileApp-->>User: Show "User already exists" error
        else User Does Not Exist
            UserController->>UserController: Hash password with bcryptjs
            UserController->>UserModel: new User({ name, email, hashedPassword })
            UserModel->>Database: Insert new user document
            Database-->>UserModel: Return new user document with _id
            UserModel-->>UserController: New user object
            UserController->>UserController: Generate JWT with user._id payload
            UserController-->>BackendAPI: 200 OK with JWT
            BackendAPI-->>MobileApp: 200 Response with token
            MobileApp->>MobileApp: Store JWT securely
            MobileApp->>MobileApp: Navigate to Profile Creation Wizard
        end
    end
```

### **Data Transformation Details:**

*   **Password Hashing:** The `password` field sent from the client is never stored in plain text. The `UserController` uses the `bcryptjs` library to generate a salt and hash the password before it is saved to the database.
*   **JWT Payload:** The JSON Web Token generated upon successful registration contains a payload with the new user's MongoDB `_id`. This allows the backend to identify the user in subsequent authenticated requests.

---

## 2. Subscription Purchase Data Flow

**Description:** This diagram illustrates the flow of data when a user purchases a premium subscription.

**Flowchart:**
```mermaid
sequenceDiagram
    participant User
    participant MobileApp as FLRVI Mobile App
    participant OmiseSDK as Omise Client-Side SDK
    participant BackendAPI as Backend API (/api/v1)
    participant PaymentController as Payment Controller
    participant OmiseAPI as Omise Server-Side API
    participant SubscriptionModel as Subscription Model
    participant Database as MongoDB

    User->>MobileApp: Taps 'Subscribe' button
    MobileApp->>OmiseSDK: Request payment token (for Thai QR)
    OmiseSDK-->>MobileApp: Returns source token
    
    MobileApp->>BackendAPI: POST /payment/subscribe with (email, planId, sourceToken)
    BackendAPI->>PaymentController: createSubscription(req, res)
    PaymentController->>OmiseAPI: Create Customer with (email, sourceToken)
    OmiseAPI-->>PaymentController: Return Omise Customer object
    
    PaymentController->>OmiseAPI: Create Subscription with (customerId, planId)
    OmiseAPI-->>PaymentController: Return Omise Subscription object
    
    PaymentController->>SubscriptionModel: new Subscription({ userId, plan, omiseCustomerId, omiseSubscriptionId, status: 'active' })
    SubscriptionModel->>Database: Insert new subscription document
    Database-->>SubscriptionModel: Return new subscription document
    SubscriptionModel-->>PaymentController: New subscription object
    
    PaymentController-->>BackendAPI: 200 OK with Omise Subscription object
    BackendAPI-->>MobileApp: 200 Response
    MobileApp->>MobileApp: Update user state to premium
    MobileApp-->>User: Show "Welcome to Premium!" success modal
```

### **Data Transformation Details:**

*   **Omise Token:** The client-side Omise SDK handles the complexities of the Thai QR payment flow and returns a single-use `source` token to the mobile app. This token is securely sent to our backend.
*   **Customer & Subscription Creation:** Our backend uses the `source` token to create a `Customer` object in Omise. This customer is then associated with a recurring `Subscription`. This two-step process is a best practice for managing subscriptions.
*   **Local Record:** We store the `omiseCustomerId` and `omiseSubscriptionId` in our own database. This allows us to manage the subscription (e.g., check its status, cancel it) without needing to store sensitive payment details.

---

## 3. Real-Time Messaging Data Flow

**Description:** This diagram illustrates the flow of data when a user sends or receives a message in real-time.

**Flowchart:**
```mermaid
sequenceDiagram
    participant UserA as User A
    participant MobileAppA as App (User A)
    participant BackendAPI as Backend API
    participant WebSocketServer as WebSocket Server
    participant MobileAppB as App (User B)
    participant UserB as User B

    UserA->>MobileAppA: Types and sends a message
    MobileAppA->>BackendAPI: POST /chat/messages with (conversationId, text)
    
    alt Message is Valid
        BackendAPI->>Database: Save message to conversation
        BackendAPI->>WebSocketServer: Emit 'newMessage' event with message payload
        BackendAPI-->>MobileAppA: 200 OK (message sent)
        
        WebSocketServer-->>MobileAppB: Push 'newMessage' event
        MobileAppB->>MobileAppB: Update Redux store with new message
        MobileAppB-->>UserB: Display new message in Chat Screen
        MobileAppB-->>UserB: Show push notification (if app is in background)
    else Message is Invalid (e.g., user is blocked)
        BackendAPI-->>MobileAppA: 403 Forbidden
        MobileAppA-->>UserA: Show "Could not send message" error
    end
```

### **Technical Details:**

*   **Hybrid Approach:** We use a hybrid approach for messaging. The initial message is sent via a standard `POST` request to the REST API. This ensures that the message is persisted to the database and allows for standard error handling.
*   **Real-Time Delivery:** After the message is saved, the backend emits an event to a **WebSocket Server**. The WebSocket server is responsible for pushing the new message in real-time to the recipient's device.
*   **Client-Side State:** When the recipient's app receives the `newMessage` event, it updates its local Redux store, which causes the UI to re-render and display the new message instantly.

---
