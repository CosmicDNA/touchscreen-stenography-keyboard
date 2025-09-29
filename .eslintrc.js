module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: [
    'standard',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  plugins: [
    'react' // 'react-hooks' is included by the extends
  ],
  rules: {
  },
  settings: {
    react: {
      version: 'detect'
    }
  }
}
