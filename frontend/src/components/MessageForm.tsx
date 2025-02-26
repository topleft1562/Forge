import { msgInfo, userInfo } from "@/utils/types";
import { getUserInfo } from "@/utils/util";
import { useEffect, useState } from "react";
import { FaUserNinja } from "react-icons/fa";

interface MessageFormProps {
  msg: msgInfo;
}

export const MessageForm: React.FC<MessageFormProps> = ({ msg }) => {
  const [user, setUser] = useState<userInfo>()
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userRaw = await getUserInfo(msg.sender as string);
        setUser(userRaw);
      } catch (error) {
        console.error("Failed to fetch user info:", error);
      }
    };

    fetchUser();
  }, [msg.sender]);
  const hasAvatar = user.avatar && user.avatar !== 'undefined';
  
  return (
    <div className="bg-[#1E1E1E] rounded-xl p-4">
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          {hasAvatar ? (
            <img
              src={user?.avatar}
              alt="Avatar"
              className="w-10 h-10 rounded-lg"
            />
          ) : (
            <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#141414] text-[#01a8dd]">
              <FaUserNinja size={24} />
            </div>
          )}
          <div className="flex items-center gap-3">
            <span className="text-white font-medium">
              {user?.name}
            </span>
            {msg.time && (
              <span className="text-[#888]">
                {msg.time.toString()}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex gap-4">
          {msg.img && (
            <img
              src={msg.img}
              alt="Message Image"
              className="rounded-lg max-w-[200px]"
            />
          )}
          <div className="text-white">
            <p className="text-lg leading-relaxed">{msg.msg}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
