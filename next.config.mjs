/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  // firebase-admin (jwks-rsa/jose) must be resolved by Node at runtime, not
  // bundled — otherwise the serverless build picks jose's ESM entry and the
  // CJS require() throws ERR_REQUIRE_ESM.
  experimental: {
    serverComponentsExternalPackages: ["firebase-admin"],
  },
};

export default nextConfig;
