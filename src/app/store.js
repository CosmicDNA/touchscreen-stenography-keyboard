import { configureStore } from '@reduxjs/toolkit'
import { apiSlice } from '../features/protocol/api/apiSlice'
import secretReducer from '../features/secret/secretSlice'

export default configureStore({
  reducer: {
    secretSlice: secretReducer,
    [apiSlice.reducerPath]: apiSlice.reducer
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware().concat(apiSlice.middleware)
})
