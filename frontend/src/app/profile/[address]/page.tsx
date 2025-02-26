"use client";
import { CoinBlog } from "@/components/CoinBlog";
import Modal from "@/components/Modal";
import { errorAlert, infoAlert } from "@/components/ToastGroup";
import { cluster } from "@/confgi";
import UserContext from "@/context/UserContext";
import { coinInfo, userInfo } from "@/utils/types";
import { getCoinsInfoBy, getUser, updateUser, uploadImage } from "@/utils/util";
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
  const [selectedFileName, setSelectedFileName] = useState("");
  const [isDragging, setIsDragging] = useState(false);


  const hasAvatar = index.avatar !== "https://gateway.pinata.cloud/ipfs/undefined"
  const avatarIMG = hasAvatar ? index.avatar : DEFAULT_AVATAR
console.log("index", index)
console.log("user", user)
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
          setNewName(response.name)
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

  const handleSave= async () => { 
    infoAlert(`Uploadeding New Profile Image!`);
    const url = await uploadImage(imageUrl);
    if (!url) {
        throw new Error('Failed to upload image');
    }
    setIndex((prev) => ({ ...prev, name: newName, avatar: url }));
    updateUser(user._id, index)
  }
  
  const [newName, setNewName] = useState(index?.name)
  const handleNameChange= async (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewName(event.target.value)
  }

  useEffect(() => {
    setSelectedFileName('');
    setImageUrl('')

    return () => {
      if (imageUrl && imageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, []);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files && event.target.files[0];
      if (file) {
        if (!file.type.startsWith('image/')) {
          errorAlert('Please select an image file');
          return;
        }
  
        if (file.size > 5 * 1024 * 1024) {
          errorAlert('File size must be less than 5MB');
          return;
        }
  
        if (imageUrl && imageUrl.startsWith('blob:')) {
          URL.revokeObjectURL(imageUrl);
        }
  
        
        setSelectedFileName(file.name);
        const url = URL.createObjectURL(file);
        setImageUrl(url);
        
      }
      
    };

    const handleRemoveImage = () => {
      if (imageUrl && imageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(imageUrl);
      }
      setImageUrl('');
      setSelectedFileName('');
    };

    const handleDrag = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };
  
    const handleDragIn = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    };
  
    const handleDragOut = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
    };
  
    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      
      const file = e.dataTransfer.files[0];
      if (file) {
        if (!file.type.startsWith('image/')) {
          errorAlert('Please select an image file');
          return;
        }
  
        if (file.size > 5 * 1024 * 1024) {
          errorAlert('File size must be less than 5MB');
          return;
        }
  
        if (imageUrl && imageUrl.startsWith('blob:')) {
          URL.revokeObjectURL(imageUrl);
        }
  
        setSelectedFileName(file.name);
        const url = URL.createObjectURL(file);
        setImageUrl(url);
        console.log(url)
      }
    };

  useEffect(() => {
    return () => {
      // Cleanup function
      if (imageUrl && imageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(imageUrl);
      }
      console.log(imageUrl)
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
                src={avatarIMG}
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
                  <span className="hideFollowers">0 followers</span>
                  
                </div>
              </div>
             
              <button 
                className="px-4 py-2 rounded-lg bg-[#1E1E1E] text-[#01a8dd]/80 hover:text-[#01a8dd] transition-colors"
                onClick={() => setIsModal(true)}
              >
                Edit profile
              </button>
              

              <div className="flex gap-6 text-sm">
                <div className="hideFollowers text-[#888]">Likes received: {0}</div>
                <div className="hideFollowers text-[#888]">Mentions received: {0}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#141414] rounded-lg p-4 text-[#888] break-all">
          <p className="font-mono text-sm">
            {index.wallet}
          </p>
          <Link 
            href={`https://solscan.io/account/${index.wallet}?cluster=${cluster}`}
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
            { id: 5, label: 'Followers', show: false },
            { id: 6, label: 'Following', show: false },
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
                  value={newName}
                  onChange={handleNameChange}
                />
              </div>

      
              <div className="mt-6">
          <label className="block mb-2 text-sm font-medium text-white">
            Add project image or video
          </label>
          <label 
            className={`file-input-label h-[200px] ${isDragging ? 'dragging' : ''}`}
            onDragEnter={handleDragIn}
            onDragLeave={handleDragOut}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              className="hidden"
              onChange={handleFileChange}
              accept="image/*"
            />
            <div className="file-input-button h-full flex flex-col items-center justify-center">
              {imageUrl ? (
                <>
                  <div className="relative">
                    <img 
                      src={imageUrl} 
                      alt="Preview" 
                      className="max-w-[140px] max-h-[100px] object-contain mb-3 rounded-lg"
                    />
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleRemoveImage();
                      }}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-[#1a1a1a] border border-[#01a8dd]/20 rounded-full flex items-center justify-center hover:border-[#01a8dd] hover:bg-[#01a8dd]/10 transition-all duration-200"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <span className="text-sm text-[#01a8dd]/60">
                    {selectedFileName}
                  </span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-base mb-2">{selectedFileName || 'Choose File'}</span>
                  <span className="text-sm text-[#01a8dd]/60">
                    Drag and drop or click to select
                  </span>
                </>
              )}
            </div>
          </label>
        </div>


              <img
                src={index.avatar}
                alt="Profile"
                className="rounded-xl object-cover w-24 h-24"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = DEFAULT_AVATAR;
                }}
              />
              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={() => setIsModal(false)}
                  className="px-6 py-2 rounded-lg text-[#01a8dd] hover:bg-[#01a8dd]/10 transition-all duration-300"
                >
                  Close
                </button>
                <button
                  type="button"
                  className="px-6 py-2 rounded-lg bg-gradient-to-r from-[#01a8dd] to-[#4088ae] text-white hover:opacity-90 transition-opacity"
                  onClick={() => handleSave()}
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
