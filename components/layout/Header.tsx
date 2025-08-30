'use client';

import Image from "next/image";
import { Sun, Moon, Menu, X } from "lucide-react";
import { Zap } from "lucide-react"; // ikona za /quick link

interface HeaderProps {
  theme?: string;
  setTheme: (theme: string) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  activeTab: string;
  handleTabChange: (value: string) => void;
  menuItems: { value: string; label: string; icon: any }[];
}

export function Header({
  theme,
  setTheme,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  activeTab,
  handleTabChange,
  menuItems,
}: HeaderProps) {
  return (
    <header className="bg-white dark:bg-slate-900 shadow-md sticky top-0 z-50 border-b border-gray-200 dark:border-slate-700">
      <div className="px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          {/* Logo + Title */}
          <div className="flex items-center gap-3">
            <Image
              src="/icons/favicon.ico"
              alt="Logo"
              width={36}
              height={36}
              className="object-contain"
              priority
            />
            <h1 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100">
              Analiza budžeta Crne Gore
            </h1>
          </div>

          {/* Desktop Menu + Controls */}
          <div className="hidden md:flex items-center gap-3">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.value}
                  onClick={() => handleTabChange(item.value)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === item.value
                      ? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}

            {/* Quick link */}
            <a
              href="/quick"
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Zap className="h-4 w-4 text-yellow-500" />
              Quick
            </a>

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-full bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5 text-yellow-400" />
              ) : (
                <Moon className="h-5 w-5 text-gray-700" />
              )}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-full bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6 text-gray-700 dark:text-gray-200" />
              ) : (
                <Menu className="h-6 w-6 text-gray-700 dark:text-gray-200" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {isMobileMenuOpen && (
        <div className="absolute left-0 right-0 top-full bg-white dark:bg-slate-900 shadow-lg border-t border-gray-200 dark:border-slate-700 md:hidden">
          <div className="py-4 px-4 space-y-2">
            {/* {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.value}
                  onClick={() => handleTabChange(item.value)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === item.value
                      ? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })} */}

            {/* Quick link */}
            <a
              href="/quick"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Zap className="h-5 w-5 text-yellow-500" />
              <span className="font-medium">Savjeti i preporuke</span>
            </a>

            <div className="border-t border-gray-200 dark:border-slate-700 pt-3 mt-3">
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                Made by VA
              </p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
