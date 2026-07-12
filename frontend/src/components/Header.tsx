import logoSrc from "../../assets/logo.png";
import profilePicSrc from "../../assets/profilePic.png";

export const Header = () => {
  return (
    <header className="bg-gray-800 flex items-center justify-between shadow-md h-[10vh]">
      <div className="md:shrink-0 h-full w-auto">
        <img
          src={logoSrc}
          alt="Simple Orders Tracker logo"
          className="h-full w-auto object-contain rounded-md"
        />
      </div>
      <h1 className="font-mono text-xs sm:text-base tracking-[.5em] text-center uppercase">
        Simple Orders Tracker
      </h1>
      <div className="md:shrink-0 h-full w-auto">
        <img
          src={profilePicSrc}
          alt="User profile"
          className="h-full w-auto rounded-full p-2"
        />
      </div>
    </header>
  );
};
