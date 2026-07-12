import { NavLink } from "react-router-dom";

const navItems = [
  {
    label: "Orders",
    to: "/orders",
    icon: (
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
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M5 21h14a1 1 0 0 0 1-1v-7H4v7a1 1 0 0 0 1 1z"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    label: "New Order",
    to: "/orders/new",
    icon: (
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
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 8v8"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8 12h8"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    label: "Reports",
    to: "/reports",
    icon: (
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
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M7 13v-6"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 17V7"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M17 11v-1"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

export const BottomNav = () => {
  return (
    <footer className="sm:hidden fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 shadow-md">
      <nav
        className="max-w-4xl mx-auto flex justify-between items-center h-14 px-4"
        aria-label="Primary navigation"
      >
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              [
                "flex flex-col items-center justify-center text-center min-w-16 transition-colors",
                isActive
                  ? "text-white"
                  : "text-gray-200 hover:text-white focus:text-white",
              ].join(" ")
            }
          >
            {item.icon}
            <span className="text-xs text-current">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </footer>
  );
};
