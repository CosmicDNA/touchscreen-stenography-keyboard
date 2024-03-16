// secretSlice.js

import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  secret: '' // Initialize with an empty string
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

const { setSecret } = secretSlice.actions

export { setSecret, secretSlice }
