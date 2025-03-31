"use client";

import { FluidCursor } from "@/components/FluidCursor";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <FluidCursor />

      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-400">
            iFreelancer
          </h1>

          <p className="text-xl md:text-2xl text-gray-300">
            Connect with Sri Lanka&apos;s top freelance talent. Find the perfect
            match for your project.
          </p>

          <div className="flex flex-col md:flex-row gap-4 justify-center items-center mt-12">
            <Link href="/auth/signin">
              <Button
                size="lg"
                className="min-w-[200px] bg-blue-600 hover:bg-blue-700"
              >
                Get Started
              </Button>
            </Link>
            <Link href="/jobs">
              <Button
                size="lg"
                variant="outline"
                className="min-w-[200px] border-blue-400 text-blue-400 hover:bg-blue-400/10"
              >
                Browse Jobs
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-20">
            <div className="p-6 rounded-lg bg-gray-800/50 backdrop-blur">
              <h3 className="text-xl font-semibold mb-3">Find Work</h3>
              <p className="text-gray-400">
                Browse through hundreds of projects and find the perfect
                opportunity.
              </p>
            </div>
            <div className="p-6 rounded-lg bg-gray-800/50 backdrop-blur">
              <h3 className="text-xl font-semibold mb-3">Hire Talent</h3>
              <p className="text-gray-400">
                Post your project and connect with skilled freelancers.
              </p>
            </div>
            <div className="p-6 rounded-lg bg-gray-800/50 backdrop-blur">
              <h3 className="text-xl font-semibold mb-3">Secure Payments</h3>
              <p className="text-gray-400">
                Safe and secure payment system for both clients and freelancers.
              </p>
            </div>
          </div>

          <div className="mt-20">
            <h2 className="text-3xl font-bold mb-8">Why Choose iFreelancer?</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="text-left">
                <h3 className="text-xl font-semibold mb-2">For Freelancers</h3>
                <ul className="list-disc list-inside text-gray-300 space-y-2">
                  <li>Access to quality local projects</li>
                  <li>Build your professional network</li>
                  <li>Flexible work opportunities</li>
                  <li>Secure payment system</li>
                </ul>
              </div>
              <div className="text-left">
                <h3 className="text-xl font-semibold mb-2">For Clients</h3>
                <ul className="list-disc list-inside text-gray-300 space-y-2">
                  <li>Access to verified local talent</li>
                  <li>Easy project management</li>
                  <li>Cost-effective solutions</li>
                  <li>Quality guaranteed work</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
