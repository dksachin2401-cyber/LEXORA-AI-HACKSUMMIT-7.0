import React, { useState } from 'react';
import { HelpCircle, Search, Globe, CheckSquare, Bot, AlertCircle, ArrowRight, ShieldCheck, FileSearch, Calculator, Sparkles, FileText } from 'lucide-react';
import { fastApi } from '@/services/fastapi';
import { VoiceMicInput } from '@/components/citizen/VoiceMicInput';
import { FreeLegalAidModal } from '@/components/citizen/FreeLegalAidModal';
import { NoticeDeciphererModal } from '@/components/citizen/NoticeDeciphererModal';
import { CourtFeeCalculatorModal } from '@/components/citizen/CourtFeeCalculatorModal';

const translations: Record<string, Record<string, string>> = {
  English: {
    portalTitle: "Citizen Legal Self-Help & Case Portal",
    subTitle: "Litigant User: Ramesh Patel | Plain Language Legal Assistance",
    caseLookupTitle: "Look Up Your Case Status",
    casePlaceholder: "Enter Case Number (e.g. CIV.SUIT 104/2025 or WP(C) 412/2024)",
    searchBtn: "Search Case",
    askTitle: "Ask Legal Questions in Plain Language",
    askSub: "Get plain explanation of legal rights, procedural steps, and court summons.",
    askPlaceholder: "Ask anything, e.g.: What should I do if I receive a court summons notice?",
    askBtn: "Get Plain Answer",
    checklistTitle: "Litigant Action Checklist",
    langLabel: "Language",
    item1: "Gather Original Title Deeds & Identity Proof",
    item2: "Engage Authorized Legal Practitioner / Legal Aid Counsel",
    item3: "Obtain Certified Copies of Impugned Order",
    item4: "Verify Court Hearing Date on Official Portal",
    completed: "Completed",
    pending: "Action Pending"
  },
  Hindi: {
    portalTitle: "नागरिक कानूनी सहायता एवं मामला पोर्टल",
    subTitle: "याचिकाकर्ता: रमेश पटेल | सरल भाषा कानूनी सहायता",
    caseLookupTitle: "अपने मामले की स्थिति देखें",
    casePlaceholder: "मामला संख्या दर्ज करें (जैसे CIV.SUIT 104/2025)",
    searchBtn: "खोजें",
    askTitle: "सरल भाषा में कानूनी प्रश्न पूछें",
    askSub: "कानूनी अधिकारों, प्रक्रियात्मक चरणों और अदालती सम्मन का सरल विवरण प्राप्त करें।",
    askPlaceholder: "कुछ भी पूछें, जैसे: यदि मुझे अदालती सम्मन मिले तो मुझे क्या करना चाहिए?",
    askBtn: "सरल उत्तर प्राप्त करें",
    checklistTitle: "याचिकाकर्ता कार्य सूची",
    langLabel: "भाषा",
    item1: "मूल संपत्ति दस्तावेज और पहचान पत्र एकत्र करें",
    item2: "अधिकृत वकील / कानूनी सहायता वकील नियुक्त करें",
    item3: "आक्षेपित आदेश की प्रमाणित प्रतियां प्राप्त करें",
    item4: "आधिकारिक पोर्टल पर सुनवाई की तिथि की पुष्टि करें",
    completed: "पूर्ण",
    pending: "कार्रवाई लंबित"
  },
  Tamil: {
    portalTitle: "குடிமக்கள் சட்ட உதவி மற்றும் வழக்கு போர்ட்டல்",
    subTitle: "வழக்குதாரர்: ரமேஷ் படேல் | எளிய மொழி சட்ட உதவி",
    caseLookupTitle: "உங்கள் வழக்கின் நிலையைக் கண்டறியவும்",
    casePlaceholder: "வழக்கு எண்ணை உள்ளிடவும் (எ.கா. CIV.SUIT 104/2025)",
    searchBtn: "தேடுங்கள்",
    askTitle: "எளிய மொழியில் சட்ட கேள்விகளைக் கேளுங்கள்",
    askSub: "சட்ட உரிமைகள் மற்றும் நீதிமன்ற அழைப்பாணைகளின் எளிய விளக்கத்தைப் பெறுங்கள்.",
    askPlaceholder: "எதையும் கேளுங்கள்: நீதிமன்ற அழைப்பாணை வந்தால் நான் என்ன செய்ய வேண்டும்?",
    askBtn: "எளிய பதிலைப் பெறுங்கள்",
    checklistTitle: "வழக்குதாரர் நடவடிக்கை சரிபார்ப்பு பட்டியல்",
    langLabel: "மொழி",
    item1: "அசல் ஆவணங்கள் மற்றும் அடையாளச் சான்றுகளைச் சேகரிக்கவும்",
    item2: "அங்கீகரிக்கப்பட்ட வழக்கறிஞரை நியமிக்கவும்",
    item3: "சான்றளிக்கப்பட்ட நகல்களைப் பெறுங்கள்",
    item4: "நீதிமன்ற விசாரணை தேதியை சரிபார்க்கவும்",
    completed: "முடிந்தது",
    pending: "நிலுவையில் உள்ளது"
  },
  Telugu: {
    portalTitle: "పౌర న్యాయ సహాయం & కేసు పోర్టల్",
    subTitle: "వాది: రమేష్ పటేల్ | సరళమైన భాషా న్యాయ సహాయం",
    caseLookupTitle: "మీ కేసు స్థితిని తనిఖీ చేయండి",
    casePlaceholder: "కేసు సంఖ్యను నమోదు చేయండి (ఉదా. CIV.SUIT 104/2025)",
    searchBtn: "శోధించండి",
    askTitle: "సరళమైన భాషలో న్యాయపరమైన ప్రశ్నలు అడగండి",
    askSub: "న్యాయపరమైన హక్కులు మరియు సమన్ల వివరణ పొందండి.",
    askPlaceholder: "సమన్లు వచ్చినప్పుడు నేను ఏమి చేయాలి?",
    askBtn: "సమాధానం పొందండి",
    checklistTitle: "వాది చర్యల తనిఖీ జాబితా",
    langLabel: "భాష",
    item1: "అసలు పత్రాలు మరియు గుర్తింపు కార్డులను సేకరించండి",
    item2: "న్యాయవాదిని సంప్రదించండి",
    item3: "ధృవీకరించబడిన ప్రతులను పొందండి",
    item4: "విచారణ తేదీని ధృవీకరించండి",
    completed: "పూర్తయింది",
    pending: "పెండింగ్‌లో ఉంది"
  },
  Marathi: {
    portalTitle: "नागरिक कायदेशीर मदत आणि केस पोर्टल",
    subTitle: "याचिकाकर्ते: रमेश पटेल | सोप्या भाषेतील कायदेशीर मदत",
    caseLookupTitle: "तुमच्या केसची स्थिती तपासा",
    casePlaceholder: "केस क्रमांक टाका (उदा. CIV.SUIT 104/2025)",
    searchBtn: "शोधा",
    askTitle: "सोप्या भाषेत कायदेशीर प्रश्न विचारा",
    askSub: "कायदेशीर हक्क आणि कोर्ट समन्सचे सोपे स्पष्टीकरण मिळवा.",
    askPlaceholder: "कोर्ट समन्स आल्यास मी काय करावे?",
    askBtn: "उत्तर मिळवा",
    checklistTitle: "याचिकाकर्ता कृती यादी",
    langLabel: "भाषा",
    item1: "मूळ कागदपत्रे आणि ओळखपत्रे गोळा करा",
    item2: "अधिकृत वकिलांची नेमणूक करा",
    item3: "प्रमाणित प्रती मिळवा",
    item4: "सुनावणीची तारीख तपासा",
    completed: "पूर्ण",
    pending: "कार्रवाई प्रलंबित"
  },
  Bengali: {
    portalTitle: "নাগরিক আইনি সহায়তা ও কেস পোর্টাল",
    subTitle: "মামলাকারী: রমেশ প্যাটেল | সহজ ভাষার আইনি সহায়তা",
    caseLookupTitle: "আপনার মামলার বিবরণ খুঁজুন",
    casePlaceholder: "কেস নম্বর লিখুন (যেমন CIV.SUIT 104/2025)",
    searchBtn: "অনুসন্ধান",
    askTitle: "সহজ ভাষায় আইনি প্রশ্ন জিজ্ঞাসা করুন",
    askSub: "আইনি অধিকার ও আদালতের সমনের সহজ ব্যাখ্যা পান।",
    askPlaceholder: "আদালতের সমন পেলে আমার কী করা উচিত?",
    askBtn: "উত্তর পান",
    checklistTitle: "মামলাকারীর করণীয় তালিকা",
    langLabel: "ভাষা",
    item1: "মূল দলিল ও পরিচয়পত্র সংগ্রহ করুন",
    item2: "আইনজীবী নিয়োগ করুন",
    item3: "সার্টিফাইড কপি সংগ্রহ করুন",
    item4: "শুনানির তারিখ যাচাই করুন",
    completed: "সম্পন্ন",
    pending: "বিচারাধীন"
  },
  Gujarati: {
    portalTitle: "નાગરિક કાનૂની સહાય અને કેસ પોર્ટલ",
    subTitle: "અરજદાર: રમેશ પટેલ | સરળ ભાષામાં કાનૂની સહાય",
    caseLookupTitle: "તમારા કેસની સ્થિતિ તપાસો",
    casePlaceholder: "કેસ નંબર દાખલ કરો (જેમ કે CIV.SUIT 104/2025)",
    searchBtn: "શોધો",
    askTitle: "સરળ ભાષામાં કાનૂની પ્રશ્નો પૂછો",
    askSub: "કાનૂની અધિકારો અને કોર્ટ સમન્સની સરળ સમજ મેળવો.",
    askPlaceholder: "કોર્ટ સમન્સ મળે તો મારે શું કરવું જોઈએ?",
    askBtn: "જવાબ મેળવો",
    checklistTitle: "અરજદાર કાર્યવાહી યાદી",
    langLabel: "ભાષા",
    item1: "મૂળ દસ્તાવેજો અને ઓળખ પુરાવા એકત્રિત કરો",
    item2: "વકીલની નિમણૂક કરો",
    item3: "પ્રમાણિત નકલો મેળવો",
    item4: "સુનાવણીની તારીખ તપાસો",
    completed: "પૂર્ણ",
    pending: "કાર્યવાહી બાકી"
  }
};

export const CitizenDashboard = () => {
  const [caseNoQuery, setCaseNoQuery] = useState('');
  const [searchedCase, setSearchedCase] = useState<any>(null);
  const [plainQuestion, setPlainQuestion] = useState('');
  const [plainAnswer, setPlainAnswer] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedLang, setSelectedLang] = useState('English');

  // Modals
  const [showLegalAidModal, setShowLegalAidModal] = useState(false);
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [showCalculatorModal, setShowCalculatorModal] = useState(false);

  const t = translations[selectedLang] || translations.English;

  const handleLookupCase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseNoQuery) return;
    setSearchedCase({
      caseNumber: caseNoQuery.toUpperCase(),
      title: 'Ramesh Patel vs. Municipal Corporation',
      court: 'District Civil Court',
      status: 'Pending Next Hearing',
      nextHearing: '22nd August 2026',
      stage: 'Filing of Written Statements',
      plainSummary: 'This case involves a civil land title dispute regarding a municipal road widening notice. The next step is for the municipal authorities to file their official response.'
    });
  };

  const handleAskPlainHelp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plainQuestion.trim()) return;
    setLoading(true);
    try {
      const res = await fastApi.askRAG(plainQuestion);
      setPlainAnswer(res);
    } catch {
      setPlainAnswer({
        answer: "📌 LEGAL RIGHTS OVERVIEW:\nUnder Indian Law and Constitution (Article 21), every citizen has the right to procedural due process and fair hearing.\n\n📋 STEP-BY-STEP PROCEDURAL GUIDE:\n1. Step 1: Obtain a copy of the legal notice / court petition.\n2. Step 2: Consult an Advocate or District Legal Services Authority (DLSA).\n3. Step 3: File a Written Statement / Reply within 30 days.\n\n🏛️ COURT SUMMONS INSTRUCTIONS:\nFailure to appear or file reply may result in an ex-parte court decision.",
        sources: ["Code of Civil Procedure, 1908 (Order VIII Rule 1)"]
      });
    } finally {
      setLoading(false);
    }
  };

  const checklist = [
    { title: t.item1, done: true },
    { title: t.item2, done: true },
    { title: t.item3, done: false },
    { title: t.item4, done: true }
  ];

  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div className="border-b border-white/15 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
            {t.portalTitle}
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1">
            {t.subTitle}
          </p>
        </div>

        {/* Multilingual Selector Pill */}
        <div className="mt-3 sm:mt-0 flex items-center gap-2 bg-[#0F1B33] px-3.5 py-2 rounded-xl border border-white/20 text-xs text-white shadow-md">
          <Globe className="w-4 h-4 text-[#C9A24B]" />
          <span className="font-bold text-slate-200">{t.langLabel}:</span>
          <select 
            value={selectedLang} 
            onChange={(e) => setSelectedLang(e.target.value)}
            className="bg-[#0A1428] font-bold text-[#C9A24B] outline-none border border-white/20 rounded px-2 py-1 cursor-pointer"
          >
            <option value="English">English</option>
            <option value="Hindi">हिंदी (Hindi)</option>
            <option value="Marathi">मराठी (Marathi)</option>
            <option value="Tamil">தமிழ் (Tamil)</option>
            <option value="Bengali">বাংলা (Bengali)</option>
            <option value="Gujarati">ગુજરાતી (Gujarati)</option>
            <option value="Telugu">తెలుగు (Telugu)</option>
          </select>
        </div>
      </div>

      {/* Citizen Power Tools Action Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => setShowLegalAidModal(true)}
          className="p-4 bg-[#132240] hover:bg-[#132240]/90 border border-white/15 hover:border-[#C9A24B] rounded-xl flex items-center gap-3 text-left transition-all group cursor-pointer shadow-lg"
        >
          <div className="p-3 bg-[#C9A24B]/15 text-[#C9A24B] rounded-xl group-hover:scale-110 transition-transform">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-white text-xs">Free Legal Aid Application</h3>
            <p className="text-[10px] text-slate-300">DLSA Section 12 Counsel Generator</p>
          </div>
        </button>

        <button
          onClick={() => setShowNoticeModal(true)}
          className="p-4 bg-[#132240] hover:bg-[#132240]/90 border border-white/15 hover:border-[#C9A24B] rounded-xl flex items-center gap-3 text-left transition-all group cursor-pointer shadow-lg"
        >
          <div className="p-3 bg-[#C9A24B]/15 text-[#C9A24B] rounded-xl group-hover:scale-110 transition-transform">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-white text-xs">Notice & Summons Decipherer</h3>
            <p className="text-[10px] text-slate-300">Plain Language Risk & Action Steps</p>
          </div>
        </button>

        <button
          onClick={() => setShowCalculatorModal(true)}
          className="p-4 bg-[#132240] hover:bg-[#132240]/90 border border-white/15 hover:border-[#C9A24B] rounded-xl flex items-center gap-3 text-left transition-all group cursor-pointer shadow-lg"
        >
          <div className="p-3 bg-[#C9A24B]/15 text-[#C9A24B] rounded-xl group-hover:scale-110 transition-transform">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-white text-xs">Court Fee & Stamp Duty Calculator</h3>
            <p className="text-[10px] text-slate-300">Ad-Valorem Filing Charge Calculator</p>
          </div>
        </button>
      </div>

      {/* Case Status Quick Lookup */}
      <div className="bg-[#132240] border border-white/15 rounded-xl p-6 shadow-xl space-y-4">
        <h2 className="text-base font-serif font-bold text-white">{t.caseLookupTitle}</h2>
        <form onSubmit={handleLookupCase} className="flex flex-col sm:flex-row gap-2.5">
          <input
            type="text"
            placeholder={t.casePlaceholder}
            value={caseNoQuery}
            onChange={(e) => setCaseNoQuery(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-xs text-white placeholder-slate-400 outline-none focus:border-[#C9A24B]"
          />
          <button type="submit" className="px-6 py-2.5 bg-[#C9A24B] text-[#1B2C4F] text-xs font-bold rounded-lg hover:bg-[#D9B35C] shadow-md cursor-pointer">
            {t.searchBtn}
          </button>
        </form>

        {searchedCase && (
          <div className="bg-white/5 border border-white/15 p-4 rounded-lg space-y-2 text-slate-200">
            <div className="flex justify-between items-center">
              <span className="font-bold text-[#C9A24B] text-sm">{searchedCase.caseNumber}</span>
              <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold rounded">
                {searchedCase.status}
              </span>
            </div>
            <p className="text-xs"><strong>Title:</strong> {searchedCase.title}</p>
            <p className="text-xs"><strong>Court:</strong> {searchedCase.court}</p>
            <p className="text-xs"><strong>Next Hearing:</strong> {searchedCase.nextHearing}</p>
            <p className="text-xs bg-[#0F1B33] p-3 rounded-lg border border-white/15 mt-2 text-slate-300 leading-relaxed">
              <strong className="text-[#C9A24B]">Plain Language Summary:</strong> {searchedCase.plainSummary}
            </p>
          </div>
        )}
      </div>

      {/* Plain Language AI Assistant with Voice Microphone Input */}
      <div className="bg-[#132240] border border-white/15 rounded-xl p-6 shadow-xl space-y-4">
        <div className="flex justify-between items-start flex-wrap gap-2">
          <div>
            <h2 className="text-base font-serif font-bold text-white flex items-center gap-2">
              <Bot className="w-5 h-5 text-[#C9A24B]" />
              {t.askTitle}
            </h2>
            <p className="text-xs text-slate-300 mt-1">{t.askSub}</p>
          </div>

          {/* Voice Microphone Button */}
          <VoiceMicInput onTranscript={(text) => setPlainQuestion(text)} lang={selectedLang === 'Hindi' ? 'hi-IN' : 'en-IN'} />
        </div>

        <form onSubmit={handleAskPlainHelp} className="space-y-3">
          <textarea
            rows={3}
            placeholder={t.askPlaceholder}
            value={plainQuestion}
            onChange={(e) => setPlainQuestion(e.target.value)}
            className="w-full p-3.5 bg-white/10 border border-white/20 rounded-xl text-xs text-white placeholder-slate-400 outline-none focus:border-[#C9A24B] leading-relaxed"
          />
          <button 
            type="submit" 
            disabled={loading}
            className="px-6 py-2.5 bg-[#C9A24B] text-[#1B2C4F] font-bold text-xs rounded-lg hover:bg-[#D9B35C] shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            {loading ? 'Asking AI Assistant...' : t.askBtn}
          </button>
        </form>

        {plainAnswer && (
          <div className="p-4 bg-white/5 border border-white/15 rounded-lg text-xs text-slate-200 space-y-2 leading-relaxed">
            <p className="whitespace-pre-wrap font-sans">{plainAnswer.answer}</p>
            {plainAnswer.sources && (
              <div className="text-[10px] text-slate-400 pt-2 border-t border-white/10">
                <strong className="text-[#C9A24B]">Legal Sources:</strong> {plainAnswer.sources.join(', ')}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Citizen Action Checklist */}
      <div className="bg-[#132240] border border-white/15 rounded-xl p-6 shadow-xl space-y-4">
        <h2 className="text-base font-serif font-bold text-white flex items-center gap-2">
          <CheckSquare className="w-5 h-5 text-[#C9A24B]" />
          {t.checklistTitle}
        </h2>
        <div className="space-y-2.5">
          {checklist.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-3.5 bg-white/5 rounded-lg border border-white/15 text-xs">
              <span className={item.done ? 'line-through text-slate-400' : 'text-white font-semibold'}>
                {item.title}
              </span>
              <span className={`px-2.5 py-1 rounded text-[10px] font-extrabold ${item.done ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'}`}>
                {item.done ? t.completed : t.pending}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      <FreeLegalAidModal isOpen={showLegalAidModal} onClose={() => setShowLegalAidModal(false)} />
      <NoticeDeciphererModal isOpen={showNoticeModal} onClose={() => setShowNoticeModal(false)} />
      <CourtFeeCalculatorModal isOpen={showCalculatorModal} onClose={() => setShowCalculatorModal(false)} />
    </div>
  );
};

export default CitizenDashboard;
