import React from "react";

export const Home = () => {
  return (
    <div>
      <header className="bg-gray-800 flex items-center justify-between shadow-md h-[10vh]">
        <div className="md:shrink-0 h-full w-auto">
          <img
            src="../../assets/logo.png"
            alt="company logo"
            className="h-full w-auto object-contain rounded-md"
          />
        </div>
        <h1 className="font-mono text-xs sm:text-base tracking-[.5em] text-center">
          SIMPLE ORDERS TRACKER
        </h1>
        <div className="md:shrink-0 h-full w-auto">
          <img
            src="../../assets/profilePic.png"
            alt="profile photo"
            className="h-full w-auto rounded-full p-2"
          />
        </div>
      </header>

      <section className="flex flex-wrap items-center justify-between py-2 px-4 mx-auto max-w-4xl">
        <div className="flex items-center ml-4">
          <svg
            className="h-5 w-5 text-gray-200 mx-0.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M3 5h18" stroke-width="2" stroke-linecap="round" />
            <path d="M6 12h12" stroke-width="2" stroke-linecap="round" />
            <path d="M10 19h4" stroke-width="2" stroke-linecap="round" />
          </svg>
          <button className="mx-0.5 py-0.5 px-1 border-2 border-gray-200 rounded-sm bg-gray-200 text-black cursor-pointer hover:bg-gray-100 hover:text-black transition-colors">
            Status
          </button>
          <button className="mx-0.5 py-0.5 px-1 border-2 border-gray-200 rounded-sm cursor-pointer hover:bg-gray-100 hover:text-black transition-colors">
            Payment
          </button>
        </div>

        <div className="relative max-[495px]:mt-3 flex-1 min-w-2xs max-w-md">
          <svg
            className="absolute left-2 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="11" cy="11" r="8" stroke-width="2" />
            <path
              d="m21 21-4.35-4.35"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
          <input
            type="text"
            placeholder="Search Orders"
            className="border-2 border-gray-200 rounded-sm p-1 pl-9 w-full max-w-2xl placeholder:text-gray-400"
          />
        </div>
      </section>

      <main className="mt-4 p-4 grid gap-4 grid-cols-autofit">
        <div className="bg-gray-700 h-[7em] rounded-md flex items-center justify-center ">
          Order 1
        </div>
        <div className="bg-gray-700 h-[7em] rounded-md flex items-center justify-center ">
          Order 2
        </div>
        <div className="bg-gray-700 h-[7em] rounded-md flex items-center justify-center ">
          Order 3
        </div>
      </main>

      <footer className="sm:hidden fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700">
        <nav className="max-w-4xl mx-auto flex justify-between items-center h-14 px-4">
          <a
            href="#"
            className="flex flex-col items-center justify-center text-center text-gray-200 hover:text-white"
          >
            <svg
              className="h-6 w-6 mb-0.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M3 11.5L12 4l9 7.5"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M5 21h14a1 1 0 0 0 1-1v-7H4v7a1 1 0 0 0 1 1z"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <span className="text-xs text-gray-300">Home</span>
          </a>

          <a
            href="#"
            className="flex flex-col items-center justify-center text-center text-gray-200 hover:text-white"
          >
            <svg
              className="h-6 w-6 mb-0.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M3 3v18h18"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M7 13v-6"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M12 17V7"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M17 11v-1"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <span className="text-xs text-gray-300">Analysis</span>
          </a>

          <a
            href="#"
            className="flex flex-col items-center justify-center text-center text-gray-200 hover:text-white"
          >
            <svg
              className="h-6 w-6 mb-0.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <circle
                cx="12"
                cy="12"
                r="9"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M12 8h.01"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M11 12h1v4"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <span className="text-xs text-gray-300">About</span>
          </a>
        </nav>
      </footer>

      <button
        aria-label="Add"
        title="Add"
        className="sm:hidden fixed bottom-20 right-5 h-14 w-14 rounded-full bg-gray-50 text-gray-800 flex items-center justify-center shadow-md hover:bg-gray-300 transition-colors focus:outline-none cursor-pointer"
      >
        <svg
          className="h-8 w-8"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4v16M4 12h16"
          />
        </svg>
      </button>
    </div>
  );
};
