"use client";
import { CoinBlog } from "@/components/CoinBlog";
import Modal from "@/components/Modal";
import UserContext from "@/context/UserContext";
import { coinInfo, userInfo } from "@/utils/types";
import { getCoinsInfo, getCoinsInfoBy, getUser } from "@/utils/util";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";

const DEFAULT_AVATAR = '/default-avatar.png';

export default function Page() {
  const { user, imageUrl, setImageUrl } = useContext(UserContext);
  const pathname = usePathname();
  const [param, setParam] = useState<string | null>(null);
  const [index, setIndex] = useState<userInfo>({} as userInfo);
  const [option, setOption] = useState<number>(1);
  const [data, setData] = useState<coinInfo[]>([]);
  const [isModal, setIsModal] = useState<boolean>(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    // Extract the last segment of the pathname
    const segments = pathname.split("/");
    const id = segments[segments.length - 1];
    if (id && id !== param && id !== 'undefined') { // Add check for 'undefined'
      setParam(id);
  
      // Async function to fetch user data
      const handleClick = async () => {
        try {
          const response = await getUser({ id });
          if (response && response.avatar) {
            // Validate the avatar URL
            const img = new Image();
            img.src = response.avatar;
            img.onerror = () => {
              response.avatar = DEFAULT_AVATAR;
            };
          }
          setIndex(response || {} as userInfo);
        } catch (error) {
          console.error("Error fetching user:", error);
          setIndex({} as userInfo);
        }
      };
  
      handleClick();
    }
  }, [pathname]);
  useEffect(() => {
    const fetchData = async () => {
      if (option == 4 && param) {
        const coinsBy = await getCoinsInfoBy(param);
        setData(coinsBy);
      }
    }
    fetchData();
  }, [option])

  const handleModalClose = () => {
    setIsModal(false);
  };
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        console.error('Invalid file type');
        return;
      }
  
      const url = URL.createObjectURL(file);
      
      // Validate the created URL
      const img = new Image();
      img.src = url;
      img.onload = () => {
        setImageUrl(url);
      };
      img.onerror = () => {
        console.error('Error loading image');
        URL.revokeObjectURL(url);
      };
  
      // Resetting the value of the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  useEffect(() => {
    return () => {
      // Cleanup function
      if (imageUrl && imageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);
  
  return (
    <div className="min-h-screen">
      <div className="max-w-[1600px] mx-auto px-8 py-6 space-y-8">
        {/* Profile Header */}
        <div className="bg-[#1a1a1a] rounded-xl p-6">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {index.avatar !== undefined && (
              <img
                src={index.avatar || DEFAULT_AVATAR}
                alt="Profile"
                className="rounded-xl object-cover w-24 h-24"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = DEFAULT_AVATAR;
                }}
              />
            )}
            <div className="space-y-4 flex-1">
              <div className="space-y-1">
                <h1 className="text-2xl font-medium text-white">@{index.name}</h1>
                <div className="flex gap-4 text-[#888]">
                  <span>0 followers</span>
                  <span>dev</span>
                </div>
              </div>
              <button 
                className="px-4 py-2 rounded-lg bg-[#1E1E1E] text-[#01a8dd]/80 hover:text-[#01a8dd] transition-colors"
                onClick={() => setIsModal(true)}
              >
                Edit profile
              </button>
              <div className="flex gap-6 text-sm">
                <div className="text-[#888]">Likes received: {0}</div>
                <div className="text-[#888]">Mentions received: {0}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#141414] rounded-lg p-4 text-[#888] break-all">
          <p className="font-mono text-sm">
            {index.wallet}
          </p>
          <Link 
            href={`https://solscan.io/account/${index.wallet}?cluster=devnet`}
            className="text-[#01a8dd] text-sm hover:text-[#01a8dd]/80 transition-colors flex items-center gap-1 mt-2"
          >
            View on Solscan ↗
          </Link>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 justify-center">
          {[
            { id: 1, label: 'Holdings', show: true },
            { id: 2, label: 'Replies', show: user.wallet === index.wallet },
            { id: 3, label: 'Notifications', show: true },
            { id: 4, label: 'Launches', show: true },
            { id: 5, label: 'Followers', show: true },
            { id: 6, label: 'Following', show: true },
          ].map(tab => tab.show && (
            <button
              key={tab.id}
              onClick={() => setOption(tab.id)}
              className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                option === tab.id
                  ? 'bg-gradient-to-r from-[#01a8dd] to-[#4088ae] text-white'
                  : 'text-[#01a8dd] hover:bg-[#01a8dd]/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <Modal isOpen={isModal} onClose={handleModalClose}>
          <div className="bg-[#1a1a1a] p-6 rounded-xl">
            <h2 className="text-2xl font-medium text-white mb-6">Edit Profile</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-[#888] text-sm mb-2">
                  Username
                </label>
                <input
                  className="w-full bg-[#141414] border border-[#3c3f44] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#01a8dd] transition-colors"
                  type="text"
                  value={index.name}
                />
              </div>
              <div className="bg-[#141414] rounded-lg p-4 border border-[#3c3f44]">
                <input
                  type="file"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  className="text-[#888]"
                />
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={() => setIsModal(false)}
                  className="px-6 py-2 rounded-lg text-[#01a8dd] hover:bg-[#01a8dd]/10 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-lg bg-gradient-to-r from-[#01a8dd] to-[#4088ae] text-white hover:opacity-90 transition-opacity"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </Modal>

        <div>
          {(option == 4) &&
            <div className="flex justify-center">
              {
                data.map((coin, index) => (
                  <Link key={index} href={`/trading/${coin?.token}`}>
                    <CoinBlog coin={coin} componentKey="coin" />
                  </Link>
                ))
              }
            </div>
          }
        </div>
      </div>
    </div>
  );
}
