import { configureStore } from '@reduxjs/toolkit'
import { apiSlice } from '../features/protocol/api/apiSlice'
import secretReducer from '../features/secret/secretSlice'

const store = configureStore({
  reducer: {
    secret: secretReducer,
    [apiSlice.reducerPath]: apiSlice.reducer
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware().concat(apiSlice.middleware)
})

export default store
