"use client";

import { Fragment, useMemo } from "react";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Common navigation items for all users
const commonNavigation = [
  { name: "Home", href: "/" },
  { name: "Find Jobs", href: "/jobs" },
];

// Role-specific navigation items
const clientNavigation = [
  { name: "Post a Job", href: "/dashboard/post-job" },
  { name: "My Jobs", href: "/dashboard/my-jobs" },
];

const freelancerNavigation = [
  { name: "Advanced Search", href: "/jobs/search" },
  { name: "My Applications", href: "/dashboard/my-applications" },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export function Navigation() {
  const { data: session } = useSession();
  const pathname = usePathname();

  // Dynamically build navigation based on user role
  const navigation = useMemo(() => {
    const baseNav = [...commonNavigation];

    if (!session?.user) {
      return baseNav;
    }

    if (session.user.role === "CLIENT") {
      return [...baseNav, ...clientNavigation];
    }

    return [...baseNav, ...freelancerNavigation];
  }, [session]);

  return (
    <Disclosure as="nav" className="bg-white shadow">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-between">
              <div className="flex">
                <div className="flex flex-shrink-0 items-center">
                  <Link href="/" className="text-2xl font-bold text-primary">
                    iFreelancer
                  </Link>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={classNames(
                          isActive
                            ? "border-primary text-gray-900"
                            : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                          "inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium"
                        )}
                      >
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:items-center">
                {session ? (
                  <Menu as="div" className="relative ml-3">
                    <div>
                      <Menu.Button className="flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                        <span className="sr-only">Open user menu</span>
                        <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center">
                          {session.user?.name?.[0] || "U"}
                        </div>
                      </Menu.Button>
                    </div>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-200"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              href="/dashboard/profile"
                              className={classNames(
                                active ? "bg-gray-100" : "",
                                "block px-4 py-2 text-sm text-gray-700"
                              )}
                            >
                              Your Profile
                            </Link>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={() => signOut()}
                              className={classNames(
                                active ? "bg-gray-100" : "",
                                "block w-full text-left px-4 py-2 text-sm text-gray-700"
                              )}
                            >
                              Sign out
                            </button>
                          )}
                        </Menu.Item>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                ) : (
                  <div className="space-x-4">
                    <Link
                      href="/auth/signin"
                      className="text-gray-500 hover:text-gray-700"
                    >
                      Sign in
                    </Link>
                    <Link
                      href="/auth/signup"
                      className="bg-primary text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition"
                    >
                      Sign up
                    </Link>
                  </div>
                )}
              </div>
              <div className="-mr-2 flex items-center sm:hidden">
                {/* Mobile menu button */}
                <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="sm:hidden">
            <div className="space-y-1 pb-3 pt-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Disclosure.Button
                    key={item.name}
                    as={Link}
                    href={item.href}
                    className={classNames(
                      isActive
                        ? "bg-primary-50 border-primary text-primary"
                        : "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800",
                      "block border-l-4 py-2 pl-3 pr-4 text-base font-medium"
                    )}
                  >
                    {item.name}
                  </Disclosure.Button>
                );
              })}
            </div>
            <div className="border-t border-gray-200 pb-3 pt-4">
              {session ? (
                <div className="space-y-1">
                  <Disclosure.Button
                    as={Link}
                    href="/dashboard/profile"
                    className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                  >
                    Your Profile
                  </Disclosure.Button>
                  <Disclosure.Button
                    as="button"
                    onClick={() => signOut()}
                    className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                  >
                    Sign out
                  </Disclosure.Button>
                </div>
              ) : (
                <div className="space-y-1 px-4">
                  <Disclosure.Button
                    as={Link}
                    href="/auth/signin"
                    className="block text-base font-medium text-gray-500 hover:text-gray-800"
                  >
                    Sign in
                  </Disclosure.Button>
                  <Disclosure.Button
                    as={Link}
                    href="/auth/signup"
                    className="block text-base font-medium text-primary hover:text-primary-dark"
                  >
                    Sign up
                  </Disclosure.Button>
                </div>
              )}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
