import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Ana Renk - Obsidyen Siyah
        obsidian: '#0B0D10',
        // İkincil Renkler - Yapısal
        graphite: '#1A1D22', // Grafit Gri - Kart arka planları
        lead: '#2A2E35', // Soğuk Kurşun Gri - Çizgiler, border
        // Üçüncül Renkler - Bilinç/Eşik
        indigo: '#2E365F', // Derin İndigo - KÂHİN metinleri
        purple: '#5A4E7C', // Soluk Mor - NOXARA alanları
        ice: '#8FAFCB', // Buz Mavisi - Mikro vurgu
        // Metin Renkleri
        text: {
          primary: '#E6E8EB', // Ana Metin
          secondary: '#B4B8C0', // İkincil Metin
          quiet: '#7A7F88', // Sessiz Metin
        },
        // Eski renkler (geriye dönük uyumluluk için)
        neon: {
          green: '#8FAFCB', // Buz Mavisi ile değiştirildi
          purple: '#5A4E7C', // Soluk Mor ile değiştirildi
        },
        dark: {
          bg: '#0B0D10', // Obsidyen Siyah
          panel: 'rgba(26, 29, 34, 0.85)', // Grafit Gri
        },
      },
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        rajdhani: ['Rajdhani', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      animation: {
        'glitch': 'glitch-anim 0.3s infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        'glitch-anim': {
          '0%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(-2px, -2px)' },
          '60%': { transform: 'translate(2px, 2px)' },
          '80%': { transform: 'translate(2px, -2px)' },
          '100%': { transform: 'translate(0)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;

