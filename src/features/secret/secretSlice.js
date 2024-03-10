// secretSlice.js

import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  secret: 'mysecrettoken' // Initialize with an empty string or your default secret
}

const secretSlice = createSlice({
  name: 'secretSlice',
  initialState,
  reducers: {
    setSecret: (state, action) => {
      state.secretSlice = action.payload // Update the secret value
    }
  }
})

export const { setSecret } = secretSlice.actions

export default secretSlice.reducer
