import { useEffect, useState } from "react";
import api, { getTelegramInitData } from "./services/api";
import { ArrowRightLeft, Check, Copy, History, Loader2 } from "lucide-react";

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
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [copied, setCopied] = useState(false);
  const [user, setUser] = useState<{ first_name: string } | null>(null);
  const [rawInitData, setRawInitData] = useState<string>("");
  useEffect(() => {
    const initUser = async () => {
      try {
        window.Telegram?.WebApp?.ready?.();
        window.Telegram?.WebApp?.expand?.();
        const initData = getTelegramInitData();

        setRawInitData(initData);
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
    if (!inputText.trim()) return;
    setLoading(true);

    try {
      const res = await api.post("/translate", { text: inputText });
      setTranslatedText(res.data.translated_text);
    } catch (error) {
      console.log("Translation error:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (activeTab === "history") {
      const fetchHistory = async () => {
        try {
          const res = await api.get("/history");
          setHistory(res.data.items || res.data || []);
        } catch (error) {
          console.log("History error:", error);
        }
      };

      fetchHistory();
    }
  }, [activeTab]);

  const handleCopy = () => {
    navigator.clipboard.writeText(translatedText);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };
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
        {/* Telegram initData Debug Box */}
        <div className="mb-4 p-3 bg-slate-800/80 border border-dashed border-amber-500/50 rounded-xl text-xs space-y-1">
          <div className="flex justify-between items-center text-amber-400 font-semibold">
            <span>Telegram WebApp Test Info:</span>
            <span>{rawInitData ? "✅ initData mavjud" : "❌ initData bo'sh / yo'q"}</span>
          </div>
          <div className="bg-slate-900 p-2 rounded border border-slate-700 text-slate-300 font-mono text-[11px] break-all max-h-32 overflow-y-auto select-all">
            {rawInitData || "window.Telegram.WebApp.initData bo'sh (Brauzerda ochilgan bo'lishi mumkin)"}
          </div>
        </div>

        {activeTab === "translate" ? (
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Eski alifbo matni:</label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Matnni shu yerga kiriting (masalan: sh, ch, o', g')..."
                className="w-full h-32 p-3  bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 text-sm resize-none"
              />
            </div>
            <button
              onClick={handleTranslate}
              disabled={loading || !inputText.trim()}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-400 font-semibold rounded-xl transition flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Tarjima qilish
            </button>
            {translatedText && (
              <div className="mt-4 p-4 bg-slate-800 border border-slate-700 rounded-xl relative">
                <span className="block text-xs text-slate-400 mb-1">Yangi aligfbo</span>
                <p className="text-base text-emerald-400 font-medium whitespace-pre-wrap">{translatedText}</p>
                <button
                  onClick={handleCopy}
                  className="absolute  top-4 right-4 p-2 bg-slate-700  hover:bg-slate-600 rounded-lg transition text-slate-300"
                  title="Nusxalash"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-400 mb-2">Tarjimalar tarixi</h2>
            {history.length === 0 ? (
              <p className="text-center text-slate-500 text-sm mt-10">Hozircha tarix bo'sh</p>
            ) : (
              history.map((item) => (
                <div key={item.id} className="p-3 bg-slate-800 border border-slate-700 rounded-xl space-y-2">
                  <div className="text-xs text-slate-400 truncate">Asl:{item.original_text}</div>
                  <div className="text-sm text-emerald-400 font-medium">Yangi:{item.translated_text}</div>
                  <div className="text-[10px] text-slate-500 text-right">
                    {new Date(item.created_at || item.created_text).toLocaleString()}
                  </div>
                </div>
              ))
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
