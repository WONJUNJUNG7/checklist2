module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        surface: '#FFFFFF',
        border: '#E2E8F0',
        accent: '#4F46E5'
      },
      boxShadow: {
        soft: '0 26px 70px rgba(15, 23, 42, 0.08)'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
};
