import { FC } from "react";
import { ConnectButton } from "./ConnectButton";
import Link from "next/link";
import Image from "next/image";

const Header: FC = () => {
  return (
    <header className="h-[100px] px-4 sm:px-0 mt-4 sm:mt-0 mb-8">
      <div className="container mx-auto h-full">
        <div className="flex flex-col sm:flex-row justify-between items-center h-full gap-4 sm:gap-0">
          <Link href="/" className="solPumpLogo hover:opacity-80 transition-opacity flex items-center gap-2">
            <Image 
              src="/sol-forge-logo.png"
              alt="SOL Forge Logo"
              width={80}
              height={80}
              className="w-[60px] sm:w-[80px] h-auto"
            />
            <span className="text-lg sm:text-xl font-bold text-white">
              SOL Forge
            </span>
          </Link>
          <ConnectButton />
        </div>
      </div>
    </header>
  );
};

export default Header;