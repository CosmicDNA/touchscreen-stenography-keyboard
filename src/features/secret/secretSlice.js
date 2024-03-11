// secretSlice.js

import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  secret: null // Initialize with an empty string or your default secret
}

const secretSlice = createSlice({
  name: 'secret',
  initialState,
  reducers: {
    setSecret: (state, action) => {
      state.secret = action.payload // Update the secret value
    }
  }
})

export const { setSecret } = secretSlice.actions

export default secretSlice.reducer
