import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/ai",
          destination: "/ai26.html",
        },
        {
          source: "/ai/",
          destination: "/ai26.html",
        },
        {
          source: "/jobs",
          destination: "https://careerops-jobboard-public.vercel.app/jobs",
        },
        {
          source: "/jobs/",
          destination: "https://careerops-jobboard-public.vercel.app/jobs/",
        },
        {
          source: "/xword",
          destination: "https://xword-lime.vercel.app",
        },
        {
          source: "/xword/",
          destination: "https://xword-lime.vercel.app/",
        },
        {
          source: "/xword/:path*",
          destination: "https://xword-lime.vercel.app/:path*",
        },
        {
          source: "/deepgram",
          destination: "https://deepgram-voice-agent-cyan.vercel.app/deepgram",
        },
        {
          source: "/deepgram/",
          destination: "https://deepgram-voice-agent-cyan.vercel.app/deepgram/",
        },
        {
          source: "/deepgram/:path*",
          destination:
            "https://deepgram-voice-agent-cyan.vercel.app/deepgram/:path*",
        },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
