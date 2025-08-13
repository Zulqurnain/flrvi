import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { RootState } from './store';

const API_URL = 'http://localhost:5000/api/v1';

export const createProfile = createAsyncThunk<
  any,
  { birthday: any; gender: string; photos: any[] },
  { rejectValue: { msg: string } }
>('user/createProfile', async (profileData, { getState, rejectWithValue }) => {
  try {
    const { token } = (getState() as RootState).user;
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    const response = await axios.post(`${API_URL}/profile`, profileData, config);
    return response.data;
  } catch (err: any) {
    return rejectWithValue(err.response.data);
  }
});

export const updateUserProfile = createAsyncThunk<
  any,
  { bio: string; photos: string[] },
  { rejectValue: { msg: string } }
>('user/updateProfile', async (profileData, { getState, rejectWithValue }) => {
  try {
    const { token } = (getState() as RootState).user;
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    const response = await axios.put(`${API_URL}/profile`, profileData, config);
    return response.data;
  } catch (err: any) {
    return rejectWithValue(err.response.data);
  }
});

export const registerUser = createAsyncThunk<
  { token: string },
  { name: string; email: string; password: string },
  { rejectValue: { msg: string } }
>('user/register', async (userData, { rejectWithValue }) => {
  try {
    const response = await axios.post(`${API_URL}/users/register`, userData);
    return response.data;
  } catch (err: any) {
    return rejectWithValue(err.response.data);
  }
});

export const loginUser = createAsyncThunk<
  { token: string },
  { email: string; password: string },
  { rejectValue: { msg: string } }
>('user/login', async (credentials, { rejectWithValue }) => {
  try {
    const response = await axios.post(`${API_URL}/users/login`, credentials);
    return response.data;
  } catch (err: any) {
    return rejectWithValue(err.response.data);
  }
});

export const fetchProfiles = createAsyncThunk<
  any[],
  void,
  { rejectValue: { msg: string } }
>('user/fetchProfiles', async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${API_URL}/profile/search`);
    return response.data;
  } catch (err: any) {
    return rejectWithValue(err.response.data);
  }
});

export const fetchConversations = createAsyncThunk<
  any[],
  void,
  { rejectValue: { msg: string } }
>('user/fetchConversations', async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${API_URL}/chat/conversations`);
    return response.data;
  } catch (err: any) {
    return rejectWithValue(err.response.data);
  }
});

export const fetchUserProfile = createAsyncThunk<
  any,
  string,
  { rejectValue: { msg: string } }
>('user/fetchUserProfile', async (userId, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${API_URL}/profile/user/${userId}`);
    return response.data;
  } catch (err: any) {
    return rejectWithValue(err.response.data);
  }
});

export const fetchCurrentUserProfile = createAsyncThunk<
  any,
  void,
  { rejectValue: { msg: string } }
>('user/fetchCurrentUserProfile', async (_, { getState, rejectWithValue }) => {
  try {
    const { token } = (getState() as RootState).user;
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    const response = await axios.get(`${API_URL}/profile/me`, config);
    return response.data;
  } catch (err: any) {
    return rejectWithValue(err.response.data);
  }
});

export const likeUserProfile = createAsyncThunk<
  any,
  string,
  { rejectValue: { msg: string } }
>('user/likeUserProfile', async (userId, { rejectWithValue }) => {
  try {
    const response = await axios.post(`${API_URL}/profile/like/${userId}`);
    return response.data;
  } catch (err: any) {
    return rejectWithValue(err.response.data);
  }
});

export const subscribeUser = createAsyncThunk<
  any,
  { email: string; plan: string; source: string },
  { rejectValue: { msg: string } }
>('user/subscribe', async (subscriptionData, { getState, rejectWithValue }) => {
  try {
    const { token } = (getState() as RootState).user;
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    const response = await axios.post(`${API_URL}/payment/subscribe`, subscriptionData, config);
    return response.data;
  } catch (err: any) {
    return rejectWithValue(err.response.data);
  }
});

export const purchaseBoost = createAsyncThunk<
  any,
  { productId: string; amount: number },
  { rejectValue: { msg: string } }
>('user/purchaseBoost', async (purchaseData, { getState, rejectWithValue }) => {
  try {
    const { token } = (getState() as RootState).user;
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    const response = await axios.post(`${API_URL}/payment/purchase-consumable`, purchaseData, config);
    return response.data;
  } catch (err: any) {
    return rejectWithValue(err.response.data);
  }
});

export const fetchBlockedUsers = createAsyncThunk<
  any[],
  void,
  { rejectValue: { msg: string } }
>('user/fetchBlockedUsers', async (_, { getState, rejectWithValue }) => {
  try {
    const { token } = (getState() as RootState).user;
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    const response = await axios.get(`${API_URL}/users/blocked`, config);
    return response.data;
  } catch (err: any) {
    return rejectWithValue(err.response.data);
  }
});

export const unblockUser = createAsyncThunk<
  any,
  string,
  { rejectValue: { msg: string } }
>('user/unblockUser', async (userId, { getState, rejectWithValue }) => {
  try {
    const { token } = (getState() as RootState).user;
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    const response = await axios.post(`${API_URL}/users/unblock`, { userId }, config);
    return response.data;
  } catch (err: any) {
    return rejectWithValue(err.response.data);
  }
});

export const updateNotificationSetting = createAsyncThunk<
  any,
  { [key: string]: boolean },
  { rejectValue: { msg: string } }
>('user/updateNotificationSetting', async (settings, { getState, rejectWithValue }) => {
  try {
    const { token } = (getState() as RootState).user;
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    const response = await axios.post(`${API_URL}/users/settings/notifications`, settings, config);
    return response.data;
  } catch (err: any) {
    return rejectWithValue(err.response.data);
  }
});

export const setLanguage = createAsyncThunk<
  any,
  string,
  { rejectValue: { msg: string } }
>('user/setLanguage', async (languageCode, { getState, rejectWithValue }) => {
  try {
    const { token } = (getState() as RootState).user;
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    const response = await axios.post(`${API_URL}/users/settings/language`, { language: languageCode }, config);
    return response.data;
  } catch (err: any) {
    return rejectWithValue(err.response.data);
  }
});

export const fetchTransactionHistory = createAsyncThunk<
  any[],
  void,
  { rejectValue: { msg: string } }
>('user/fetchTransactionHistory', async (_, { getState, rejectWithValue }) => {
  try {
    const { token } = (getState() as RootState).user;
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    const response = await axios.get(`${API_URL}/payment/history`, config);
    return response.data;
  } catch (err: any) {
    return rejectWithValue(err.response.data);
  }
});

const userSlice = createSlice({
  name: 'user',
  initialState: {
    token: null,
    profile: null,
    profiles: [],
    conversations: [],
    blockedUsers: [],
    transactions: [],
    status: 'idle',
    error: null as string | null,
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
        state.error = action.payload ? (action.payload as { msg: string }).msg : 'Login failed';
      })
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.token = action.payload.token;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ? (action.payload as { msg: string }).msg : 'Registration failed';
      })
      .addCase(createProfile.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.profile = action.payload;
      })
      .addCase(createProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ? (action.payload as { msg: string }).msg : 'Profile creation failed';
      })
      .addCase(updateUserProfile.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.profile = action.payload;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ? (action.payload as { msg: string }).msg : 'Profile update failed';
      })
      .addCase(fetchProfiles.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchProfiles.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.profiles = action.payload;
      })
      .addCase(fetchProfiles.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ? (action.payload as { msg: string }).msg : 'Fetching profiles failed';
      })
      .addCase(fetchConversations.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.conversations = action.payload;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ? (action.payload as { msg: string }).msg : 'Fetching conversations failed';
      })
      .addCase(fetchUserProfile.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.profile = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ? (action.payload as { msg: string }).msg : 'Fetching user profile failed';
      })
      .addCase(likeUserProfile.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(likeUserProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
      })
      .addCase(likeUserProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ? (action.payload as { msg: string }).msg : 'Liking user profile failed';
      })
      .addCase(fetchCurrentUserProfile.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCurrentUserProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.profile = action.payload;
      })
      .addCase(fetchCurrentUserProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ? (action.payload as { msg: string }).msg : 'Fetching current user profile failed';
      })
      .addCase(subscribeUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(subscribeUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Update user profile to reflect premium status
        if (state.profile) {
          state.profile.isPremium = true;
        }
      })
      .addCase(subscribeUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ? (action.payload as { msg: string }).msg : 'Subscription failed';
      })
      .addCase(purchaseBoost.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(purchaseBoost.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Update user profile to reflect boost status if needed
        // This could involve setting a boost expiration timestamp
      })
      .addCase(purchaseBoost.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ? (action.payload as { msg: string }).msg : 'Boost purchase failed';
      })
      .addCase(fetchBlockedUsers.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchBlockedUsers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.blockedUsers = action.payload;
      })
      .addCase(fetchBlockedUsers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ? (action.payload as { msg: string }).msg : 'Failed to fetch blocked users';
      })
      .addCase(unblockUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(unblockUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Remove the unblocked user from the blocked users list
        if (state.blockedUsers) {
          state.blockedUsers = state.blockedUsers.filter((user: any) => user.id !== action.meta.arg);
        }
      })
      .addCase(unblockUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ? (action.payload as { msg: string }).msg : 'Failed to unblock user';
      })
      .addCase(updateNotificationSetting.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateNotificationSetting.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Update the user's notification settings
        if (state.profile) {
          state.profile.notificationSettings = {
            ...state.profile.notificationSettings,
            ...action.meta.arg
          };
        }
      })
      .addCase(updateNotificationSetting.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ? (action.payload as { msg: string }).msg : 'Failed to update notification settings';
      })
      .addCase(setLanguage.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(setLanguage.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Update the user's language preference
        if (state.profile) {
          state.profile.language = action.meta.arg;
        }
      })
      .addCase(setLanguage.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ? (action.payload as { msg: string }).msg : 'Failed to set language';
      })
      .addCase(fetchTransactionHistory.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchTransactionHistory.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.transactions = action.payload;
      })
      .addCase(fetchTransactionHistory.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ? (action.payload as { msg: string }).msg : 'Failed to fetch transaction history';
      });
  },
});

export const { logout } = userSlice.actions;
export const selectUserRegistrationStatus = (state: RootState) => state.user.status;
export const selectSubscriptionStatus = (state: RootState) => state.user.profile?.isPremium || false;
export const selectBoostPurchaseStatus = (state: RootState) => state.user.status;
export const selectBlockedUsers = (state: RootState) => state.user.blockedUsers || [];
export const selectNotificationSettings = (state: RootState) => state.user.profile?.notificationSettings || {};
export const selectCurrentLanguage = (state: RootState) => state.user.profile?.language || 'en';
export const selectAvailableLanguages = () => [
  { code: 'en', name: 'English' },
  { code: 'th', name: 'Thai' }
];
export const selectTransactionHistory = (state: RootState) => state.user.transactions || [];
export default userSlice.reducer;
