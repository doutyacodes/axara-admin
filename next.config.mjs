import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./app/i18n/request.js");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // reactStrictMode: false,
  serverExternalPackages: ["ssh2", "ssh2-sftp-client"],
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
