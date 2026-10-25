import { defineConfig } from 'vite';
export default defineConfig({base:'/tower-survival/',build:{target:'es2020',minify:'esbuild',cssMinify:true,rollupOptions:{output:{manualChunks(id){if(id.includes('node_modules/three'))return 'three';}}}}});
