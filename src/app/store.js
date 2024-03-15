// import { configureStore } from '@reduxjs/toolkit'
// import { serverSlice } from '../features/server/serverSlice'
// import { apiSlice } from '../features/protocol/api/apiSlice'

// const reducer = Object.fromEntries([serverSlice, apiSlice]
//   .map(slice => [slice.reducerPath, slice.reducer]))

// const store = configureStore({
//   reducer,
//   middleware: getDefaultMiddleware =>
//     getDefaultMiddleware().concat(apiSlice.middleware)
// })

// export default store

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
