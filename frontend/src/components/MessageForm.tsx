import { msgInfo, userInfo } from "@/utils/types";
import { FaUserNinja } from "react-icons/fa";

interface MessageFormProps {
  msg: msgInfo;
}

export const MessageForm: React.FC<MessageFormProps> = ({ msg }) => {
  const hasAvatar = (msg.sender as userInfo)?.avatar && (msg.sender as userInfo).avatar !== 'undefined';

  return (
    <div className="bg-[#1E1E1E] rounded-xl p-4">
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          {hasAvatar ? (
            <img
              src={(msg.sender as userInfo).avatar}
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
              {(msg.sender as userInfo).name}
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
