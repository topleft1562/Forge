import { coinInfo, msgInfo, replyInfo, tradeInfo, userInfo } from "@/utils/types";
import { MessageForm } from "./MessageForm";
import { ChangeEvent, useContext, useEffect, useState } from "react";
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
  const [currentPage, setCurrentPage] = useState(1);
  const tradesPerPage = 10;
  const [isModal, setIsModal] = useState<Boolean>(false);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [msg, setMsg] = useState<string>("");
  const { user, messages, setMessages } = useContext(UserContext);
  const [selectedFileName, setSelectedFileName] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      if (param) {
        if (isTrades) {
          const data = await getMessageByCoin(param);
          setMessages(data);
        } else {
          const data = await getCoinTrade(param);
          // Sort trades by newest first
          if (data.record) {
            data.record.sort((a, b) => 
              new Date(b.time).getTime() - new Date(a.time).getTime()
            );
          }
          setTrades(data);
        }
      }
    }
    fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
  }, [isTrades, param]);
  
    // Add these pagination helpers
    const indexOfLastTrade = currentPage * tradesPerPage;
    const indexOfFirstTrade = indexOfLastTrade - tradesPerPage;
    const currentTrades = trades.record 
      ? trades.record.slice(indexOfFirstTrade, indexOfLastTrade) 
      : [];
    const totalPages = trades.record 
      ? Math.ceil(trades.record.length / tradesPerPage) 
      : 0;
  
    // Add pagination handler
    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

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
  return (
    <div className="threadHolder">
      <div className="flex gap-4 mb-6">
        <button
          className={`px-6 py-2 rounded-lg transition-all duration-300 ${
            isTrades
              ? 'bg-gradient-to-r from-[#01a8dd] to-[#4088ae] text-white'
              : 'text-[#01a8dd] hover:bg-[#01a8dd]/10'
          }`}
          onClick={() => setIsTrades(true)}
        >
          Thread
        </button>
        <button
          className={`px-6 py-2 rounded-lg transition-all duration-300 ${
            !isTrades
              ? 'bg-gradient-to-r from-[#01a8dd] to-[#4088ae] text-white'
              : 'text-[#01a8dd] hover:bg-[#01a8dd]/10'
          }`}
          onClick={() => setIsTrades(false)}
        >
          Trades
        </button>
      </div>
      <div>
        {isTrades ? (
          coin && (
            <div className="space-y-4">
              <div className="bg-[#1E1E1E] rounded-xl p-4">
                <div className="flex items-center gap-4">
                  {(coin?.creator as userInfo)?.avatar && (coin?.creator as userInfo).avatar !== 'undefined' ? (
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

              {/* Messages */}
              {messages && messages.map((message, index) => (
                <MessageForm key={index} msg={message} />
              ))}

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
          )
        ) : (
          <div>
            {/* Table Header - Hide on mobile */}
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

            {currentTrades.map((trade, index) => (
              <Trade 
                key={index} 
                trade={trade} 
                ticker={coin.ticker}
              />
            ))}

            {/* Update pagination styling */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    currentPage === 1 
                      ? 'bg-[#1e1f23] text-[#888] cursor-not-allowed' 
                      : 'bg-[#1e1f23] text-[#01a8dd] hover:bg-[#01a8dd]/10'
                  }`}
                >
                  Previous
                </button>

                <div className="flex gap-1">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => paginate(i + 1)}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        currentPage === i + 1 
                          ? 'bg-[#01a8dd] text-white' 
                          : 'bg-[#1e1f23] text-[#01a8dd] hover:bg-[#01a8dd]/10'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    currentPage === totalPages 
                      ? 'bg-[#1e1f23] text-[#888] cursor-not-allowed' 
                      : 'bg-[#1e1f23] text-[#01a8dd] hover:bg-[#01a8dd]/10'
                  }`}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
