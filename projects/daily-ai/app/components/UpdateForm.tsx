import React, { useState, useEffect, useRef } from 'react';
import { DailyUpdate, Attachment } from '../types';
import { transcribeAudio } from '../services/geminiService';

interface UpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (update: DailyUpdate) => void;
  data: DailyUpdate;
}

const UpdateModal: React.FC<UpdateModalProps> = ({ isOpen, onClose, onSubmit, data }) => {
  const [formData, setFormData] = useState<DailyUpdate>(data);
  const [step, setStep] = useState(0);
  
  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    setFormData(data);
    setStep(0);
    setIsRecording(false);
  }, [data, isOpen]);

  // Cleanup timer
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  if (!isOpen) return null;

  const handleChange = (field: keyof DailyUpdate, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else {
      onSubmit(formData);
      onClose();
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  // --- AUDIO LOGIC ---
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const newAttachment: Attachment = {
            id: Date.now().toString(),
            type: 'audio',
            url: reader.result as string,
            name: `Voice Note ${new Date().toLocaleTimeString()}`
          };
          setFormData(prev => ({
            ...prev,
            attachments: [...(prev.attachments || []), newAttachment],
            audioUrl: reader.result as string // Also set main audio url
          }));
        };
      };

      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error("Error accessing microphone", err);
      alert("Microphone permission denied or not available.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
      // Stop all tracks
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  // --- FILE ATTACHMENT LOGIC ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        let type: 'image' | 'video' | 'audio' | 'file' = 'file';
        if (file.type.startsWith('image/')) type = 'image';
        else if (file.type.startsWith('video/')) type = 'video';
        else if (file.type.startsWith('audio/')) type = 'audio';

        const newAttachment: Attachment = {
          id: Date.now().toString(),
          type: type,
          url: reader.result as string,
          name: file.name
        };
        setFormData(prev => ({
          ...prev,
          attachments: [...(prev.attachments || []), newAttachment]
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAttachment = (id: string) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments?.filter(a => a.id !== id)
    }));
  };

  const renderStepIndicator = () => (
    <div className="flex justify-center gap-2 mb-8">
      {[0, 1, 2, 3].map((i) => (
        <div 
          key={i}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            i <= step ? 'w-8 bg-indigo-500' : 'w-2 bg-slate-800'
          }`}
        />
      ))}
    </div>
  );

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md transition-opacity">
      <div className="bg-[#0f172a] rounded-[2.5rem] w-full max-w-xl shadow-2xl overflow-hidden animate-fade-in-up border border-slate-800 relative ring-1 ring-white/10">
        
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-slate-800 rounded-full text-slate-500 hover:text-slate-300 transition-colors z-20">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-8 md:p-12 min-h-[550px] flex flex-col">
          
          <div className="flex items-center gap-4 mb-8">
            <div className={`w-12 h-12 rounded-2xl ${formData.avatarColor} flex items-center justify-center text-white text-xl font-bold shadow-md`}>
              {formData.user.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-200">{formData.user}</h2>
              <p className="text-sm text-slate-500 font-medium">{formData.role}</p>
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            {step === 0 && (
              <div className="animate-fade-in space-y-6">
                <h3 className="text-3xl font-bold text-slate-100">Are you working today?</h3>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => { handleChange('isDayOff', false); handleNext(); }}
                    className={`p-6 rounded-2xl border-2 text-left transition-all group ${
                      !formData.isDayOff 
                      ? 'border-indigo-500 bg-indigo-900/10' 
                      : 'border-slate-800 bg-slate-900 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-4xl mb-3 block transform group-hover:scale-110 transition-transform">🚀</span>
                    <span className="font-bold text-lg text-slate-200 block">I'm In</span>
                    <span className="block text-slate-500 text-sm mt-1">Ready to work</span>
                  </button>
                  <button 
                    onClick={() => { handleChange('isDayOff', true); }}
                    className={`p-6 rounded-2xl border-2 text-left transition-all group ${
                      formData.isDayOff 
                      ? 'border-teal-500 bg-teal-900/10' 
                      : 'border-slate-800 bg-slate-900 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-4xl mb-3 block transform group-hover:scale-110 transition-transform">🌴</span>
                    <span className="font-bold text-lg text-slate-200 block">Day Off</span>
                    <span className="block text-slate-500 text-sm mt-1">See you later</span>
                  </button>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="animate-fade-in space-y-4">
                <label className="text-3xl font-bold text-slate-100 block">Yesterday's Wins</label>
                <textarea 
                  autoFocus
                  className="w-full h-40 bg-slate-900 border border-slate-800 rounded-2xl p-5 text-xl text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder-slate-700 resize-none"
                  value={formData.yesterday}
                  onChange={(e) => handleChange('yesterday', e.target.value)}
                  placeholder="I worked on..."
                  onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleNext(); }}}
                />
              </div>
            )}

            {step === 2 && (
              <div className="animate-fade-in space-y-4">
                <label className="text-3xl font-bold text-slate-100 block">Today's Focus</label>
                <textarea 
                  autoFocus
                  className="w-full h-40 bg-slate-900 border border-slate-800 rounded-2xl p-5 text-xl text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder-slate-700 resize-none"
                  value={formData.today}
                  onChange={(e) => handleChange('today', e.target.value)}
                  placeholder="I am focusing on..."
                  onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleNext(); }}}
                />
              </div>
            )}

            {step === 3 && (
              <div className="animate-fade-in space-y-6">
                <div>
                  <label className="text-xl font-bold text-slate-100 block mb-3">Any blockers?</label>
                  <input 
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-lg text-slate-200 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all placeholder-slate-700"
                    value={formData.blockers}
                    onChange={(e) => handleChange('blockers', e.target.value)}
                    placeholder="None"
                  />
                </div>

                {/* Attachments Section */}
                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                  <label className="text-xs font-bold text-slate-400 block mb-3 uppercase tracking-wide">
                    Attachments (Files, Audio, Video)
                  </label>
                  
                  <div className="flex flex-wrap gap-3">
                    {/* File Upload Button */}
                    <label className="w-20 h-20 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors group relative overflow-hidden">
                      <input 
                        type="file" 
                        className="hidden" 
                        onChange={handleFileUpload} 
                        accept="image/*,video/*,audio/*,.pdf,.doc,.docx" 
                      />
                      <svg className="w-6 h-6 text-slate-400 group-hover:text-white mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span className="text-[10px] font-bold text-slate-500 group-hover:text-slate-300">File</span>
                    </label>

                    {/* Audio Record Button */}
                    <button
                      onClick={isRecording ? stopRecording : startRecording}
                      className={`w-20 h-20 rounded-xl border border-dashed flex flex-col items-center justify-center cursor-pointer transition-all group relative overflow-hidden ${
                        isRecording 
                        ? 'bg-rose-500/10 border-rose-500/50 text-rose-500' 
                        : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      {isRecording ? (
                        <>
                          <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse mb-1"></div>
                          <span className="text-[10px] font-bold">{formatTime(recordingTime)}</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                          </svg>
                          <span className="text-[10px] font-bold">Rec</span>
                        </>
                      )}
                    </button>

                    {/* Previews */}
                    {formData.attachments?.map(att => (
                      <div key={att.id} className="relative group w-20 h-20">
                         {att.type === 'image' ? (
                           <img src={att.url} alt="attachment" className="w-full h-full rounded-xl object-cover border border-slate-700" />
                         ) : (
                           <div className="w-full h-full rounded-xl bg-slate-800 flex items-center justify-center border border-slate-700 relative overflow-hidden">
                             {att.type === 'video' ? (
                               <svg className="w-8 h-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                             ) : att.type === 'audio' ? (
                               <svg className="w-8 h-8 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                             ) : (
                               <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                               </svg>
                             )}
                           </div>
                         )}
                         <button 
                           onClick={() => removeAttachment(att.id)}
                           className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10"
                         >
                           <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                         </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                   <div className="flex justify-between items-center mb-4">
                    <label className="text-xl font-bold text-slate-100">Necessity Score</label>
                    <div className={`px-4 py-1 rounded-lg text-xl font-bold ${
                      formData.necessityScore > 7 ? 'bg-rose-950 text-rose-500' : 
                      formData.necessityScore > 4 ? 'bg-amber-950 text-amber-500' : 'bg-emerald-950 text-emerald-500'
                    }`}>
                      {formData.necessityScore}/10
                    </div>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="10" 
                    value={formData.necessityScore}
                    onChange={(e) => handleChange('necessityScore', parseInt(e.target.value))}
                    className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400"
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-2 font-bold uppercase tracking-wider">
                     <span>Async OK</span>
                     <span>Must Sync</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8">
            {step > 0 && renderStepIndicator()}
            
            <div className="flex gap-4">
              {step > 0 && (
                <button 
                  onClick={handleBack}
                  className="px-8 py-4 rounded-xl font-bold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all"
                >
                  Back
                </button>
              )}
              
              <button 
                onClick={formData.isDayOff ? () => { onSubmit(formData); onClose(); } : handleNext}
                disabled={isRecording}
                className={`flex-1 bg-white hover:bg-slate-200 text-slate-900 font-bold py-4 rounded-xl transition-all shadow-lg active:scale-[0.99] flex items-center justify-center gap-2 ${
                  isRecording ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {formData.isDayOff ? 'Confirm Day Off' : (step === 3 ? 'Finish & Save' : 'Next Step')}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default UpdateModal;