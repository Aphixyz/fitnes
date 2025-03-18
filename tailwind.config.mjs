/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class', // เพิ่มบรรทัดนี้
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3861fb', // สีน้ำเงินเข้มจากเมนูของคุณ
          dark: '#2a4bce'
        },
        background: {
          light: '#f5f7fa',
          dark: '#121212' 
        },
        card: {
          light: '#ffffff',
          dark: '#1e1e1e'
        },
        text: {
          light: '#1f2937',
          dark: '#e5e7eb'
        }
      },
    },
  },
  plugins: [],
};