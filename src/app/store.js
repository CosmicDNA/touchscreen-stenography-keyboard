import { configureStore } from '@reduxjs/toolkit'
import { secretSlice } from '../features/secret/secretSlice'
import { apiSlice } from '../features/protocol/api/apiSlice'

const combineSlices = (...slicesArray) => Object.fromEntries(slicesArray
  .map(slice => [slice.reducerPath, slice.reducer]))

const reducer = combineSlices(secretSlice, apiSlice)

const store = configureStore({
  reducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware().concat(apiSlice.middleware)
})

export default store
