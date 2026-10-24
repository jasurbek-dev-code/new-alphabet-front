import { useEffect, useState } from "react";
import api, { getTelegramInitData } from "./services/api";
import {
  ArrowRightLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  History,
  Loader2,
} from "lucide-react";

interface HistoryItem {
  id: number;
  original_text: string;
  translated_text: string;
  created_at: string;
}
function App() {
  const [activeTab, setActiveTab] = useState<"translate" | "history">("translate");
  const [inputText, setInputText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [lastTranslatedText, setLastTranslatedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [copied, setCopied] = useState(false);
  const [user, setUser] = useState<{ first_name: string } | null>(null);

  // Pagination state
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    const initUser = async () => {
      try {
        window.Telegram?.WebApp?.ready?.();
        window.Telegram?.WebApp?.expand?.();
        const initData = getTelegramInitData();

        if (initData) {
          const res = await api.post("/auth/sync", { init_data: initData });
          setUser(res.data.user || res.data);
        }
      } catch (error) {
        console.log("Auth error:", error);
      }
    };
    initUser();
  }, []);

  const handleTranslate = async () => {
    const trimmed = inputText.trim();
    if (!trimmed || trimmed === lastTranslatedText.trim()) return;
    setLoading(true);

    try {
      const res = await api.post("/translate", { text: inputText });
      setTranslatedText(res.data.translated_text);
      setLastTranslatedText(inputText);
    } catch (error) {
      console.log("Translation error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    if (activeTab === "history") {
      api
        .get(`/history?page=${historyPage}&per_page=${pageSize}`)
        .then((res) => {
          if (!isMounted) return;
          const items = res.data.items || res.data || [];
          setHistory(items);
          setTotalItems(res.data.total ?? items.length);
        })
        .catch((error) => {
          if (isMounted) console.log("History error:", error);
        })
        .finally(() => {
          if (isMounted) setHistoryLoading(false);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [activeTab, historyPage, pageSize]);

  const handleCopy = () => {
    navigator.clipboard.writeText(translatedText);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const handleSelectHistoryItem = (item: HistoryItem) => {
    setInputText(item.original_text);
    setTranslatedText(item.translated_text);
    setLastTranslatedText(item.original_text);
    setActiveTab("translate");
  };

  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const isTranslateDisabled =
    loading ||
    !inputText.trim() ||
    inputText.trim() === lastTranslatedText.trim();
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100  flex flex-col justify-between font-sans">
      {/*Header*/}
      <header className="p-4 bg-slate-800 border-b border-slate-700 text-center">
        <h1 className="text-lg font-black text-blue-400 flex items-center justify-center gap-2">
          <ArrowRightLeft className="w-5 h-5" /> Alifbo Translatsiya
        </h1>
        {user && <p className="text-xs text-slate-400 mt-1">Xush kelibsiz, {user.first_name || "Foydalanuvchi"}</p>}
      </header>
      {/* Main Content */}
      <main className="flex-1 p-4 max-w-md w-full mx-auto">
        {activeTab === "translate" ? (
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Eski alifbo matni:</label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Matnni shu yerga kiriting (masalan: sh, ch, o', g')..."
                className="w-full h-32 p-3 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 text-sm resize-none"
              />
            </div>
            <button
              onClick={handleTranslate}
              disabled={isTranslateDisabled}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed font-semibold rounded-xl transition flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Tarjima qilish
            </button>
            {translatedText && (
              <div className="mt-4 p-4 bg-slate-800 border border-slate-700 rounded-xl relative">
                <span className="block text-xs text-slate-400 mb-1">Yangi alifbo</span>
                <p className="text-base text-emerald-400 font-medium whitespace-pre-wrap pr-10">{translatedText}</p>
                <button
                  onClick={handleCopy}
                  className="absolute top-4 right-4 p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition text-slate-300"
                  title="Nusxalash"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-slate-400">Tarjimalar tarixi ({totalItems})</h2>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>Sahifa hajmi:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setHistoryPage(1);
                  }}
                  className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            {historyLoading ? (
              <div className="flex justify-center items-center py-12 text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                Yuklanmoqda...
              </div>
            ) : history.length === 0 ? (
              <p className="text-center text-slate-500 text-sm mt-10">Hozircha tarix bo'sh</p>
            ) : (
              <div className="space-y-2">
                {history.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleSelectHistoryItem(item)}
                    title="Translate bo'limiga yuklash uchun bosing"
                    className="p-3 bg-slate-800 border border-slate-700 hover:border-blue-500/50 rounded-xl space-y-1.5 cursor-pointer transition active:scale-[0.99] max-h-36 overflow-hidden flex flex-col justify-between"
                  >
                    <div className="text-xs text-slate-400 truncate whitespace-nowrap overflow-hidden text-ellipsis">
                      <span className="font-semibold text-slate-500">Asl:</span> {item.original_text}
                    </div>
                    <div className="text-sm text-emerald-400 font-medium truncate whitespace-nowrap overflow-hidden text-ellipsis">
                      <span className="font-semibold text-emerald-600/80">Yangi:</span> {item.translated_text}
                    </div>
                    <div className="text-[10px] text-slate-500 text-right">
                      {new Date(item.created_at).toLocaleString()}
                    </div>
                  </div>
                ))}

                {/* Pagination Controls */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs text-slate-400">
                  <span>
                    Sahifa {historyPage} / {totalPages}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                      disabled={historyPage <= 1 || historyLoading}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg border border-slate-700 text-slate-300 transition"
                      title="Oldingi sahifa"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setHistoryPage((p) => Math.min(totalPages, p + 1))}
                      disabled={historyPage >= totalPages || historyLoading}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg border border-slate-700 text-slate-300 transition"
                      title="Keyingi sahifa"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
      {/* Bottom navigation */}
      <nav className="bg-slate-800 border-t border-slate-700 flex justify-around p-3">
        <button
          onClick={() => setActiveTab("translate")}
          className={` flex flex-col items-center gap-1 text-xs ${
            activeTab === "translate" ? "text-blue-400" : "text-slate-400  hover:text-slate-200"
          }`}
        >
          {<ArrowRightLeft className="w-5 h-5" />}
          Tarjima
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={` flex flex-col items-center gap-1 text-xs ${
            activeTab === "history" ? "text-blue-400" : "text-slate-400  hover:text-slate-200"
          }`}
        >
          {<History className="w-5 h-5" />}
          Tarix
        </button>
      </nav>
    </div>
  );
}

export default App;
