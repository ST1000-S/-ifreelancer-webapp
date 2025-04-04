import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { Suspense } from "react";
import { headers } from "next/headers";

export const metadata = {
  title: "Authentication - iFreelancer",
  description: "Sign in to your iFreelancer account",
};

const RetroGrid = ({
  angle = 65,
  cellSize = 40,
  opacity = 0.6,
  lightLineColor = "rgba(59, 130, 246, 0.4)",
  darkLineColor = "rgba(59, 130, 246, 0.4)",
}) => {
  const gridStyles = {
    "--grid-angle": `${angle}deg`,
    "--cell-size": `${cellSize}px`,
    "--opacity": opacity,
    "--light-line": lightLineColor,
    "--dark-line": darkLineColor,
  } as React.CSSProperties;

  return (
    <div
      className="pointer-events-none absolute size-full overflow-hidden [perspective:200px] opacity-[var(--opacity)]"
      style={gridStyles}
    >
      <div className="absolute inset-0 [transform:rotateX(var(--grid-angle))]">
        <div className="animate-grid [background-image:linear-gradient(to_right,var(--light-line)_1px,transparent_0),linear-gradient(to_bottom,var(--light-line)_1px,transparent_0)] [background-repeat:repeat] [background-size:var(--cell-size)_var(--cell-size)] [height:300vh] [inset:0%_0px] [margin-left:-200%] [transform-origin:100%_0_0] [width:600vw] dark:[background-image:linear-gradient(to_right,var(--dark-line)_1px,transparent_0),linear-gradient(to_bottom,var(--dark-line)_1px,transparent_0)]" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent to-90%" />
    </div>
  );
};

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    const session = await getServerSession(authOptions);

    if (session) {
      // Get the callback URL from the search params
      const url = new URL(headers().get("x-url") || "", "http://localhost");
      const callbackUrl = url.searchParams.get("callbackUrl") || "/dashboard";
      redirect(callbackUrl);
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-950 via-blue-900 to-blue-950 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Retro grid background */}
        <RetroGrid />

        {/* Gradient overlay */}
        <div className="absolute top-0 z-[0] h-screen w-screen bg-purple-950/10 dark:bg-purple-950/10 bg-[radial-gradient(ellipse_20%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_20%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />

        {/* Animated background elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent"></div>
          <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-indigo-600/20 via-transparent to-transparent"></div>
        </div>

        {/* Floating shapes */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-blue-500/10 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full mix-blend-multiply filter blur-xl animate-blob delay-2000"></div>
        <div className="absolute bottom-10 left-20 w-32 h-32 bg-indigo-500/10 rounded-full mix-blend-multiply filter blur-xl animate-blob delay-4000"></div>

        <div className="relative z-10 w-full max-w-md space-y-8">
          <Suspense
            fallback={
              <div className="flex justify-center">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            }
          >
            {children}
          </Suspense>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Auth layout error:", error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-950 via-blue-900 to-blue-950 py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center bg-white/10 backdrop-blur-sm p-8 rounded-lg border border-white/20 shadow-xl">
            <h2 className="text-2xl font-bold text-white">
              Authentication Error
            </h2>
            <p className="mt-2 text-gray-300">
              There was a problem with authentication. Please try again.
            </p>
            <button
              onClick={() => (window.location.href = "/auth/signin")}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Return to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }
}
