"use client";

import { FluidCursor } from "@/components/FluidCursor";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HeroLamp, HeroContent } from "@/components/ui/HeroLamp";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";

export default function Home() {
  const { data: session, status } = useSession();

  // Determine the destination for the "Get Started" button based on auth status
  const getStartedLink = session ? "/dashboard" : "/auth/signin";

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white overflow-hidden">
      <FluidCursor />

      <HeroLamp className="min-h-[80vh] flex items-center justify-center">
        <HeroContent>
          <motion.h1
            className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-400"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            iFreelancer
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-gray-300 mt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
          >
            Connect with Sri Lanka&apos;s top freelance talent. Find the perfect
            match for your project.
          </motion.p>

          <motion.div
            className="flex flex-col md:flex-row gap-4 justify-center items-center mt-12"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <Link href={getStartedLink}>
              <Button
                size="lg"
                className="min-w-[200px] bg-blue-600 hover:bg-blue-700 text-lg h-14"
              >
                Get Started
              </Button>
            </Link>
            <Link href="/jobs">
              <Button
                size="lg"
                variant="outline"
                className="min-w-[200px] border-blue-400 text-blue-400 hover:bg-blue-400/10 text-lg h-14"
              >
                Browse Jobs
              </Button>
            </Link>
          </motion.div>
        </HeroContent>
      </HeroLamp>

      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="grid md:grid-cols-3 gap-8 mt-10">
            <motion.div
              className="p-6 rounded-lg bg-gray-800/50 backdrop-blur"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <h3 className="text-xl font-semibold mb-3">Find Work</h3>
              <p className="text-gray-400">
                Browse through hundreds of projects and find the perfect
                opportunity.
              </p>
            </motion.div>
            <motion.div
              className="p-6 rounded-lg bg-gray-800/50 backdrop-blur"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h3 className="text-xl font-semibold mb-3">Hire Talent</h3>
              <p className="text-gray-400">
                Post your project and connect with skilled freelancers.
              </p>
            </motion.div>
            <motion.div
              className="p-6 rounded-lg bg-gray-800/50 backdrop-blur"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <h3 className="text-xl font-semibold mb-3">Secure Payments</h3>
              <p className="text-gray-400">
                Safe and secure payment system for both clients and freelancers.
              </p>
            </motion.div>
          </div>

          <motion.div
            className="mt-20"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
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
          </motion.div>
        </div>
      </div>
    </div>
  );
}
