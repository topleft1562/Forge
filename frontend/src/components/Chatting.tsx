import { coinInfo, msgInfo, replyInfo, tradeInfo, userInfo } from "@/utils/types";
import { MessageForm } from "./MessageForm";
import { ChangeEvent, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Trade } from "./Trade";
import { getCoinTrade, getMessageByCoin, postReply, uploadImage } from "@/utils/util";
import UserContext from "@/context/UserContext";
import ReplyModal from "./ReplyModal";
import { FaUserNinja } from "react-icons/fa";

interface ChattingProps {
  param: string | null;
  coin: coinInfo
}

export const Chatting: React.FC<ChattingProps> = ({ param, coin }) => {
  const [trades, setTrades] = useState<tradeInfo>({} as tradeInfo);
  const [isTrades, setIsTrades] = useState<Boolean>(true);
  const [visibleCount, setVisibleCount] = useState(10); // Number of items to show initially
  const [isModal, setIsModal] = useState<Boolean>(false);
  const { user, messages, setMessages } = useContext(UserContext);
  const [currentPage, setCurrentPage] = useState(1);
  const tradesPerPage = 10;
  const [imageUrl, setImageUrl] = useState<string>("");
  const [msg, setMsg] = useState<string>("");
  const [selectedFileName, setSelectedFileName] = useState("");

  const handleModalToggle = () => {
    setIsModal(!isModal);
  };
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];
    if (file) {
      setSelectedFileName(file.name);
      const url = URL.createObjectURL(file);
      setImageUrl(url);
    }
  };

  const replyPost = async () => {
    const sender = user?._id ?? "999999999999999999999999"

    let reply: replyInfo = {
        coinId: coin._id,
        sender: sender,  // Will be either user._id or "Anonymous"
        msg: msg,
    };

    if (imageUrl) {
        const url = await uploadImage(imageUrl);
        if (url) {
            reply.img = url;
        }
    }

    handleModalToggle();
    await postReply(reply);
};

  useEffect(() => {
    const fetchData = async () => {
      if (param) {
        if (isTrades) {
          const data = await getMessageByCoin(param);
          setMessages(data);
        } else {
          const data = await getCoinTrade(param);
          if (data.record) {
            data.record.sort((a, b) => 
              new Date(b.time).getTime() - new Date(a.time).getTime()
            );
          }
          setTrades(data);
        }
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [isTrades, param]);

  // Scrollable container reference
  const tradeContainerRef = useRef<HTMLDivElement>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);

  // Load more items when scrolled to bottom
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollTop + clientHeight >= scrollHeight - 20) {
      setVisibleCount((prev) => prev + 10); // Load 10 more
    }
  }, []);

  return (
    <div className="threadHolder">
      <div className="flex gap-4 mb-6">
        <button
          className={`px-6 py-2 rounded-lg transition-all duration-300 ${
            isTrades ? 'bg-gradient-to-r from-[#01a8dd] to-[#4088ae] text-white' : 'text-[#01a8dd] hover:bg-[#01a8dd]/10'
          }`}
          onClick={() => setIsTrades(true)}
        >
          Thread
        </button>
        <button
          className={`px-6 py-2 rounded-lg transition-all duration-300 ${
            !isTrades ? 'bg-gradient-to-r from-[#01a8dd] to-[#4088ae] text-white' : 'text-[#01a8dd] hover:bg-[#01a8dd]/10'
          }`}
          onClick={() => setIsTrades(false)}
        >
          Trades
        </button>
      </div>

      {/* **Scrollable Message List** */}
      {isTrades ? (
        <div className="space-y-4">
        

        {/* Messages */}
        {<div className="space-y-4 max-h-[400px] overflow-y-auto" ref={messageContainerRef} onScroll={handleScroll}>
        <div className="bg-[#1E1E1E] rounded-xl p-4">
          <div className="flex items-center gap-4">
            {(coin?.creator as userInfo)?.avatar && (coin?.creator as userInfo).avatar !== "https://gateway.pinata.cloud/ipfs/undefined" ? (
              <img
                src={(coin?.creator as userInfo)?.avatar}
                alt="Token IMG"
                className="w-10 h-10 rounded-lg"
              />
            ) : (
              <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#141414] text-[#01a8dd]">
                <FaUserNinja size={24} />
              </div>
            )}
            <div className="flex items-center gap-3">
              <span className="text-white font-medium">
                {(coin?.creator as userInfo)?.name}
              </span>
              {coin.date && (
                <span className="text-[#888]">
                  {coin.date.toString()}
                </span>
              )}
            </div>
          </div>
          {coin.url && (
            <div className="mt-4">
              <img
                src={coin.url}
                alt="Token IMG"
                className="rounded-lg max-w-[200px]"
              />
            </div>
          )}
        </div>
          {messages && messages.slice(0, visibleCount).map((message, index) => (
            <MessageForm key={index} msg={message} />
          ))}
        </div>}

        {/* Post Reply Button */}
        <button 
          onClick={() => setIsModal(true)}
          className="w-full py-3 text-[#01a8dd] hover:text-white hover:bg-[#01a8dd]/10 rounded-lg transition-all duration-300"
        >
          + Post Reply
        </button>

        {/* Modal styling updates */}
        <ReplyModal show={isModal} onClose={handleModalToggle}>
          <div className="bg-[#1a1a1a] p-6 rounded-xl">
            <h2 className="text-2xl font-medium text-white mb-6">Post Reply</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[#888] text-sm mb-2">
                  Message
                </label>
                <textarea
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  className="w-full bg-[#141414] border border-[#3c3f44] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#01a8dd] transition-colors"
                  placeholder="Write your message..."
                  rows={4}
                />
              </div>

              <div className="bg-[#141414] rounded-lg p-4 border border-[#3c3f44]">
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="text-[#888]"
                />
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button 
                  onClick={handleModalToggle}
                  className="px-6 py-2 rounded-lg text-[#01a8dd] hover:bg-[#01a8dd]/10 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
onClick={replyPost}
className={`px-6 py-2 rounded-lg bg-gradient-to-r from-[#01a8dd] to-[#4088ae] text-white 
        hover:opacity-90 transition-opacity`}
>
{user?._id ? 'Post Reply' : 'Post Anonymously'}
</button>
              </div>
            </div>
          </div>
        </ReplyModal>
      </div>
        
      ) : (
        <div>
          <div className="bg-[#1e1f23] rounded-xl p-4 hidden md:block">
            <div className="grid grid-cols-7 gap-4">
              <p className="text-[#888] font-medium">Account</p>
              <p className="text-[#888] font-medium">Type</p>
              <p className="text-[#888] font-medium">Amount In</p>
              <p className="text-[#888] font-medium">Amount Out</p>
              <p className="text-[#888] font-medium">Price</p>
              <p className="text-[#888] font-medium">Date</p>
              <p className="text-[#888] font-medium">Transaction</p>
            </div>
          </div>

          {/* **Scrollable Trade List** */}
          <div className="max-h-[400px] overflow-y-auto" ref={tradeContainerRef} onScroll={handleScroll}>
            {trades.record && trades.record.slice(0, visibleCount).map((trade, index) => (
              <Trade key={index} trade={trade} ticker={coin.ticker} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};