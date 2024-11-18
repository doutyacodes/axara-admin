import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./app/i18n/request.js");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // reactStrictMode: false,
  images: {
    remotePatterns: [
        {
          protocol: 'https',
          hostname: 'images.pexels.com',
          pathname: '**',
        },
        {
          protocol: 'https',
          hostname: 'wowfy.in',  // Added this line to allow images from wowfy.in
          pathname: '**',
        },
      ],
  },
};

export default withNextIntl(nextConfig);
