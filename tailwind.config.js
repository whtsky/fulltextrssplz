const colors = require('tailwindcss/colors')

module.exports = {
  mode: 'jit',
  purge: ['./index.html'],
  theme: {
    extend: {
      colors: {
        cyan: colors.cyan,
      },
    },
  },
  variants: {},
  plugins: [require('@tailwindcss/forms'),],
}
