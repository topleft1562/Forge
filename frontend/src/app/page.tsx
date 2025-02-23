"use client";

import Header from "@/components/Header";
import { CoinBlog } from "@/components/CoinBlog";
import { getCoinsInfo, test } from "@/utils/util";
import Image from "next/image";
import { useContext, useEffect, useRef, useState } from "react";
import Link from "next/link";
import UserContext from "@/context/UserContext";
import { coinInfo } from "@/utils/types";
import { GiThorHammer } from "react-icons/gi";
import GradientText from "@/components/GradientText";

export default function Home() {
  const { isLoading, setIsLoading, isCreated } = useContext(UserContext);
  const [totalStaked, setTotalStaked] = useState(0);
  const [token, setToken] = useState("");
  const [data, setData] = useState<coinInfo[]>([]);
  // Store full coin data separately so we can filter without re-sorting every time.
  const [allData, setAllData] = useState<coinInfo[]>([]);
  const [dataSort, setDataSort] = useState<string>("Order of Forges");
  const [isSort, setIsSort] = useState(0);
  const [order, setOrder] = useState("desc");
  // Set activeTab to either "live" or "migrated"
  const [activeTab, setActiveTab] = useState("live");
  const [king, setKing] = useState<coinInfo>({} as coinInfo);
  const dropdownRef = useRef(null);
  const dropdownRef1 = useRef(null);

  // Fetch coin data (and sort descending by reserveOne)
  useEffect(() => {
    const fetchData = async () => {
      const coins = await getCoinsInfo();
      if (coins !== null) {
        // Sort descending so the coin with the highest reserveOne is first.
        const sortedCoins = coins.sort((a, b) => b.reserveOne - a.reserveOne);
        setAllData(sortedCoins);
        setKing(sortedCoins[0]);
        setIsLoading(true);
      }
    };

    fetchData(); // Run immediately on mount
    const interval = setInterval(fetchData, 20000); // Run every 20 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let filtered = activeTab === "live"
      ? allData.filter((coin) => !coin.isMigrated)
      : allData.filter((coin) => coin.isMigrated);
  
    if (token.trim() !== "") {
      const lowerToken = token.toLowerCase();
      filtered = filtered.filter((coin) =>
        coin.name.toLowerCase().includes(lowerToken) ||
        coin.ticker.toLowerCase().includes(lowerToken) ||
        coin.description.toLowerCase().includes(lowerToken)
      );
    }
    setData(filtered);
  }, [allData, activeTab, token]);

  const handleSortSelection = (option) => {
    let sortOption: string = "";
    let orderOption: string = "";
    let sortedData = [...data]; // Prevent direct state mutation
    if (option == "desc" || option == "asc") {
      setOrder(option);
      sortOption = dataSort;
      orderOption = option;
    } else {
      setDataSort(option);
      sortOption = option;
      orderOption = order;
    }
    if (orderOption == "desc") {
      switch (sortOption) {
        case "forge order":
          sortedData.sort((a, b) => a.reserveOne - b.reserveOne);
          break;
        case "creation time":
          sortedData.sort(
            (a, b) =>
              new Date(a.date).getTime() - new Date(b.date).getTime()
          );
          break;
        default:
          sortedData = data;
          break;
      }
    } else {
      switch (sortOption) {
        case "forge order":
          sortedData.sort((a, b) => b.reserveOne - a.reserveOne);
          break;
        case "creation time":
          sortedData.sort(
            (a, b) =>
              new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          break;
        default:
          sortedData = data;
          break;
      }
    }
    setData(sortedData);
    setIsSort(0); // Close the dropdown after selection
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        dropdownRef1.current &&
        !dropdownRef1.current.contains(event.target)
      ) {
        setIsSort(0);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef, dropdownRef1]);

  const searchToken = () => {};

  return (
    <main className="min-h-screen flex-col justify-between p-4 sm:p-24 sm:pt-2 pb-20">
      <div className="flex justify-center items-center">
        <div className="flex items-center">
          <Link rel="stylesheet" href="/create-coin">
            <div className="flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 hover:bg-[#4088ae]/5 transition-all duration-300">
              <GiThorHammer size={32} className="text-[#fff] sm:w-10 sm:h-10" />
              <GradientText className="forgeCTA text-lg sm:text-[24px] font-semibold whitespace-nowrap">
                Forge a New Token
              </GradientText>
            </div>
          </Link>
        </div>
      </div>

      <div className="flex-col content-between">
        <div className="relative py-8">
          {/* Decorative background - changed to blue only */}
          <div className="absolute"></div>

          {/* Title with decorative elements */}
          <div className="relative flex items-center justify-center gap-3 mb-6">
            <div className="h-[2px] w-12 bg-gradient-to-r from-transparent via-[#01a8dd] to-transparent"></div>
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#01a8dd] to-[#4088ae]">
              Forge Master
            </h1>
            <div className="h-[2px] w-12 bg-gradient-to-r from-transparent via-[#01a8dd] to-transparent"></div>
          </div>

          {/* Card container for the "king" coin */}
          <div className="relative flex justify-center px-4">
            {king && king._id ? (
              <Link href={`/trading/${king._id}`}>
                <div className="transform transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#01a8dd]/10 to-[#4088ae]/10 rounded-xl blur-xl"></div>
                  <div className="relative">
                    <CoinBlog coin={king} componentKey="king" />
                  </div>
                </div>
              </Link>
            ) : (
              <div className="animate-pulse flex space-x-4">
                <div className="rounded-xl bg-slate-700/50 h-[200px] w-[400px]"></div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tab Buttons for Live and Migrated */}
      <div className="flex justify-center gap-4 mb-8">
        <button
          className={`px-4 py-2 rounded ${
            activeTab === "live"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-800"
          }`}
          onClick={() => setActiveTab("live")}
        >
          Live
        </button>
        <button
          className={`px-4 py-2 rounded ${
            activeTab === "migrated"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-800"
          }`}
          onClick={() => setActiveTab("migrated")}
        >
          Migrated
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 px-4 sm:px-0 mb-8 items-center">
        {/* Sort Dropdown */}
        <div ref={dropdownRef} className="w-full sm:w-auto relative">
          <button
            className="modern-dropdown-btn w-full"
            onClick={() => setIsSort(1)}
          >
            <span>SORT: {dataSort}</span>
            <svg
              className={`w-4 h-4 transition-transform ${
                isSort === 1 ? "rotate-180" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {isSort === 1 && (
            <div className="modern-dropdown-menu">
              <button
                onClick={() => handleSortSelection("forge order")}
                className="modern-dropdown-item"
              >
                Sort: Forge Order
              </button>
              <button
              
              <button
                onClick={() => handleSortSelection("creation time")}
                className="modern-dropdown-item"
              >
                Sort: Creation Time
              </button>
            </div>
          )}
        </div>

        {/* Order Dropdown */}
        <div ref={dropdownRef1} className="w-full sm:w-auto relative">
          <button
            className="modern-dropdown-btn w-full"
            onClick={() => setIsSort(2)}
          >
            <span>ORDER: {order.toUpperCase()}</span>
            <svg
              className={`w-4 h-4 transition-transform ${
                isSort === 2 ? "rotate-180" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {isSort === 2 && (
            <div className="modern-dropdown-menu">
              <button
                onClick={() => handleSortSelection("desc")}
                className="modern-dropdown-item"
              >
                Sort: Descending
              </button>
              <button
                onClick={() => handleSortSelection("asc")}
                className="modern-dropdown-item"
              >
                Sort: Ascending
              </button>
            </div>
          )}
        </div>

        {/* Search Input */}
        <div className="w-full sm:w-auto sm:ml-auto max-w-[300px]">
          <div className="relative flex items-center">
            <input
              type="text"
              value={token}
              placeholder="Search for Token"
              onChange={(e) => setToken(e.target.value)}
              className="modern-input w-full"
            />
            <button
              className="absolute right-4 text-[#01a8dd] hover:text-[#4088ae] transition-colors"
              onClick={searchToken}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {data && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4 sm:px-0 max-w-7xl mx-auto">
          {data.map((temp, index) => (
            <Link href={`/trading/${temp._id}`} key={index}>
              <CoinBlog coin={temp} componentKey="coin" />
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
