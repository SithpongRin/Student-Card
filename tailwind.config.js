/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        moul: ['Moul', 'Khmer OS Muol Light', 'Khmer OS Muol', 'serif'],
        battambang: ['Battambang', 'Khmer OS Battambang', 'sans-serif'],
        siemreap: ['Siemreap', 'sans-serif'],
        kantumruy: ['Kantumruy Pro', 'sans-serif'],
      },
      colors: {
        card: {
          blue: '#163d7e', // Official Cambodian stencil/card navy blue
          darkblue: '#0d2550',
          lightblue: '#1d4ed8',
          border: '#153e7e',
          text: '#112f60',
        },
        md3: {
          primary: '#005fb0',
          onPrimary: '#ffffff',
          primaryContainer: '#d4e3ff',
          onPrimaryContainer: '#001c3b',
          secondary: '#555f71',
          secondaryContainer: '#d9e3f8',
          surface: '#fdfcff',
          surfaceVariant: '#e1e2ec',
          outline: '#74777f',
          background: '#f8f9fc',
        }
      }
    },
  },
  plugins: [],
}
