// /** @type {import('next').NextConfig} */
// const nextConfig = {
//     basePath: "/template-nextjs",
//     output: "export",
//     images: { unoptimized: true } ,
// }

// // const nextConfig = {
// //     output: 'export',
// //     distDir: 'dist'
// // };

// export default nextConfig;

/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV === 'development';

const nextConfig = {
  ...(isDev
    ? {} // 開発環境では basePath なし
    : {
        basePath: "/template-nextjs",
        output: "export",
        images: { unoptimized: true }
      }
  )
};

export default nextConfig;
