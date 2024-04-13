/** @type {import('next').NextConfig} */
const nextConfig = {
  // If the below is uncommented, there are problem with dynamic routing and the `generateStaticParams` function
  // output: 'export', // Outputs a Single-Page Application (SPA).
  distDir: './dist', // Changes the build output directory to `./dist/`.
}
 
export default nextConfig