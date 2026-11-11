import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({root:'client',plugins:[react()],build:{outDir:'../dist',emptyOutDir:true},server:{host:'0.0.0.0',proxy:{'/socket.io':'http://localhost:3000'}}});
