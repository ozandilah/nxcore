"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Dynamic import to avoid SSR issues
let NProgress: any;
if (typeof window !== "undefined") {
  import("nprogress-v2").then((module) => {
    NProgress = module.NProgress;
    NProgress.configure({ showSpinner: false, speed: 400 });
  });
}

export default function ProgressBar() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== "undefined" && NProgress) {
      NProgress.start();
      const timeout = setTimeout(() => {
        NProgress.done();
      }, 400);

      return () => {
        clearTimeout(timeout);
        NProgress.done();
      };
    }
  }, [pathname]);

  // Load CSS dynamically
  useEffect(() => {
    if (typeof window !== "undefined") {
      import("nprogress-v2/dist/index.css");
    }
  }, []);

  return null;
}

