// Import the RTK Query methods from the React-specific entry point
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { encryptionProcess } from '../../../components/utils/encryptionWrapper'

// Define our single API slice object
export const apiSlice = createApi({
  // The cache reducer expects to be added at `state.api` (already default - this is optional)
  reducerPath: 'api',
  // All of our requests will have URLs starting with '/fakeApi'
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:8086'
  }),
  // The "endpoints" represent operations and requests for this server
  endpoints: builder => ({
    // The `getPosts` endpoint is a "query" operation that returns data
    getProtocol: builder.query({
      // The URL for the request is '/fakeApi/posts'
      query: ({ publicKey, object }) => {
        const params = encryptionProcess(publicKey, object)
        return {
          url: '/protocol',
          params
        }
      }
    }),
    getPublicKey: builder.query({
      query: () => {
        return {
          url: '/getpublickey'
        }
      }
    })
  })
})

// Export the auto-generated hook for the `getPosts` query endpoint
export const { useGetProtocolQuery, useGetPublicKeyQuery } = apiSlice
