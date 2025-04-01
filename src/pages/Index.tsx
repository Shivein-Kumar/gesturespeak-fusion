
import { useState, useRef, useEffect } from 'react';
import { 
  Camera,
  ArrowRight,
  X,
  Download,
  Languages,
  Settings,
  ChevronDown,
  ChevronUp,
  Volume2
} from 'lucide-react';

// Language options for TTS
const LANGUAGE_OPTIONS = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
];

export default function Index() {
  // State variables
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [translatedText, setTranslatedText] = useState('');
  const [inputText, setInputText] = useState('');
  const [capturedImage, setCapturedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [translateMode, setTranslateMode] = useState('camera');
  const [ttsSettings, setTtsSettings] = useState({
    language: 'en',
    pitch: 1,
    rate: 0.75,
    volume: 1
  });
  const [showSettings, setShowSettings] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Permission setup
  useEffect(() => {
    const setupCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
        }
        setHasCameraPermission(true);
      } catch (error) {
        console.error('Camera access denied:', error);
        setHasCameraPermission(false);
      }
    };

    // Only setup camera if in camera mode
    if (translateMode === 'camera') {
      setupCamera();
    }

    // Cleanup function to stop stream when component unmounts
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [translateMode]);

  // Enhanced Text-to-Speech function
  const speakText = () => {
    if (!translatedText || !('speechSynthesis' in window)) return;
    
    setIsSpeaking(true);
    const utterance = new SpeechSynthesisUtterance(translatedText);
    utterance.lang = ttsSettings.language;
    utterance.pitch = ttsSettings.pitch;
    utterance.rate = ttsSettings.rate;
    utterance.volume = ttsSettings.volume;
    
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => {
      console.error('Speech error');
      setIsSpeaking(false);
    };
    
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  // Toggle TTS settings panel
  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };

  // Update TTS settings
  const updateTtsSetting = (key, value) => {
    setTtsSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Camera Capture Methods
  const captureImage = async () => {
    try {
      if (videoRef.current && canvasRef.current) {
        console.log("Capturing image from video");
        const video = videoRef.current;
        const canvas = canvasRef.current;
        
        // Set the canvas dimensions to match the video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        console.log(`Canvas dimensions set to ${canvas.width}x${canvas.height}`);
        
        // Draw the current video frame to the canvas
        const context = canvas.getContext('2d');
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert the canvas to a data URL
        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
        console.log("Image captured successfully");
        
        // Set the captured image
        setCapturedImage(imageDataUrl);
      } else {
        console.error("Video or canvas refs not available");
        return;
      }

      setIsProcessing(true);
      // Simulate processing delay - in a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setTranslatedText('Hello! How are you? (Sample Sign Language Translation)');
      setIsProcessing(false);
    } catch (error) {
      console.error("Image capture error:", error);
      setTranslatedText('Error in translation');
      setIsProcessing(false);
    }
  };

  const resetTranslation = () => {
    setTranslatedText('');
    setInputText('');
    setCapturedImage(null);
  };

  const downloadImage = async () => {
    if (capturedImage) {
      const link = document.createElement('a');
      link.href = capturedImage;
      link.download = `sign_language_capture_${Date.now()}.jpg`;
      link.click();
    }
  };

  // Handle text input translation
  const handleTextTranslation = () => {
    if (inputText.trim()) {
      setTranslatedText(inputText);
    }
  };

  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
      setHasCameraPermission(true);
    } catch (err) {
      console.error("Camera access error:", err);
      alert("Camera access denied. Please enable camera access in your browser settings.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-900 to-violet-900">
      {/* Header */}
      <header className="sticky top-0 z-10 backdrop-blur-lg bg-black/20 border-b border-white/10 p-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Languages className="h-6 w-6 text-indigo-300" />
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 to-purple-200">
                TalkHands Express
              </h1>
            </div>
            
            <button className="bg-transparent border-none text-indigo-200 hover:text-white cursor-pointer p-2">
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto p-4 py-8 space-y-6">
        {/* Input Methods Tabs */}
        <div className="w-full">
          <div className="grid grid-cols-2 w-full max-w-md mx-auto mb-6 bg-black/20 border border-white/10 rounded-md">
            <button 
              onClick={() => setTranslateMode('camera')}
              className={`flex items-center justify-center px-3 py-1.5 ${translateMode === 'camera' ? 'bg-indigo-600 text-white' : 'text-gray-300'}`}
            >
              <Camera className="h-4 w-4 mr-2" />
              Camera
            </button>
            <button 
              onClick={() => setTranslateMode('text')}
              className={`flex items-center justify-center px-3 py-1.5 ${translateMode === 'text' ? 'bg-indigo-600 text-white' : 'text-gray-300'}`}
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              Text
            </button>
          </div>
          
          <div className="flex justify-center">
            {/* Camera Tab */}
            {translateMode === 'camera' && (
              <div className="w-full max-w-2xl">
                <div className="bg-black/20 backdrop-blur-md border border-indigo-400/20 rounded-lg overflow-hidden">
                  <div className="p-6 space-y-4">
                    <h2 className="text-xl font-semibold text-indigo-100 text-center">Sign Language Recognition</h2>
                    
                    <div className="relative">
                      {capturedImage ? (
                        <div className="relative">
                          <img 
                            src={capturedImage} 
                            alt="Captured sign language" 
                            className="rounded-xl w-full h-auto max-h-[400px] object-contain mx-auto bg-black/40"
                          />
                          <div className="absolute bottom-4 right-4 flex space-x-2">
                            <button 
                              onClick={downloadImage}
                              className="w-10 h-10 rounded-full bg-indigo-600/80 hover:bg-indigo-600 text-white border-none flex items-center justify-center"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => setCapturedImage(null)}
                              className="w-10 h-10 rounded-full bg-red-600/80 hover:bg-red-600 text-white border-none flex items-center justify-center"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="relative bg-black/30 rounded-xl overflow-hidden mx-auto" style={{ width: '400px', height: '300px' }}>
                          {hasCameraPermission ? (
                            <>
                              <video 
                                ref={videoRef} 
                                autoPlay 
                                playsInline
                                muted
                                className="w-full h-full object-cover"
                              />
                              <canvas ref={canvasRef} className="hidden" />
                            </>
                          ) : (
                            <div className="flex items-center justify-center h-full bg-violet-900/20 text-center p-4">
                              <div>
                                <Camera className="h-12 w-12 mx-auto mb-2 text-indigo-300/50" />
                                <p className="text-indigo-200">Camera access is required for this feature</p>
                                <button 
                                  className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white border-none px-4 py-2 rounded-md"
                                  onClick={requestCameraPermission}
                                >
                                  Enable Camera
                                </button>
                              </div>
                            </div>
                          )}
                          
                          {hasCameraPermission && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <button
                                className="rounded-full w-16 h-16 bg-gradient-to-tr from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 border-none shadow-lg cursor-pointer flex items-center justify-center"
                                onClick={captureImage}
                                disabled={isProcessing}
                              >
                                <Camera className="h-8 w-8 text-white" />
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Text Tab */}
            {translateMode === 'text' && (
              <div className="w-full max-w-2xl">
                <div className="bg-black/20 backdrop-blur-md border border-indigo-400/20 rounded-lg">
                  <div className="p-6 space-y-4">
                    <h2 className="text-xl font-semibold text-indigo-100 text-center">Text Input</h2>
                    
                    <div className="space-y-4">
                      <textarea
                        className="w-full h-40 p-4 bg-black/30 text-indigo-100 placeholder:text-indigo-300/50 rounded-xl border border-indigo-500/30 focus:border-indigo-400 outline-none resize-none"
                        placeholder="Enter text to translate..."
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                      />
                      
                      <button 
                        className="w-full bg-gradient-to-tr from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium py-2 px-4 rounded-md flex items-center justify-center cursor-pointer"
                        onClick={handleTextTranslation}
                      >
                        <ArrowRight className="h-4 w-4 mr-2" />
                        Process Text
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Output Card */}
        <div className="bg-black/30 backdrop-blur-xl border border-indigo-400/20 max-w-2xl mx-auto overflow-hidden rounded-lg">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-indigo-100">Translation Result</h2>
              
              {translatedText && (
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={resetTranslation}
                    className="text-indigo-200 hover:text-white hover:bg-white/10 p-2 bg-transparent border-none rounded-md cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  
                  <div className="relative">
                    <button 
                      onClick={toggleSettings}
                      className="text-indigo-200 hover:text-white hover:bg-white/10 flex items-center space-x-1 bg-transparent border-none py-1 px-3 rounded-md cursor-pointer"
                    >
                      <span className="uppercase text-xs font-bold">{ttsSettings.language}</span>
                      {showSettings ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </button>
                    
                    {showSettings && (
                      <div className="absolute top-full right-0 mt-2 bg-violet-950/90 backdrop-blur-xl border border-indigo-500/30 text-indigo-100 rounded-md p-4 w-64 z-10">
                        <h3 className="font-medium mb-3">Speech Settings</h3>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium mb-2">Language</h4>
                            <div className="grid grid-cols-2 gap-2">
                              {LANGUAGE_OPTIONS.map(lang => (
                                <button 
                                  key={lang.code}
                                  className={`px-3 py-1 rounded-md ${ttsSettings.language === lang.code 
                                    ? "bg-indigo-600 hover:bg-indigo-700 text-white border-none cursor-pointer" 
                                    : "border border-indigo-500/50 bg-indigo-950/50 text-indigo-200 cursor-pointer"
                                  }`}
                                  onClick={() => updateTtsSetting('language', lang.code)}
                                >
                                  {lang.name}
                                </button>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium">Speech Rate</h4>
                              <span className="text-sm">{ttsSettings.rate.toFixed(1)}x</span>
                            </div>
                            <input
                              type="range"
                              min="0.5"
                              max="1.5"
                              step="0.1"
                              value={ttsSettings.rate}
                              onChange={(e) => updateTtsSetting('rate', parseFloat(e.target.value))}
                              className="w-full"
                            />
                          </div>
                          
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium">Pitch</h4>
                              <span className="text-sm">{ttsSettings.pitch.toFixed(1)}x</span>
                            </div>
                            <input
                              type="range"
                              min="0.5"
                              max="2"
                              step="0.1"
                              value={ttsSettings.pitch}
                              onChange={(e) => updateTtsSetting('pitch', parseFloat(e.target.value))}
                              className="w-full"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={isSpeaking ? stopSpeaking : speakText}
                    className={`text-indigo-200 hover:text-white hover:bg-white/10 p-2 bg-transparent border-none rounded-md relative cursor-pointer ${isSpeaking ? "text-indigo-400" : ""}`}
                  >
                    {isSpeaking && (
                      <span className="absolute inset-0 animate-ping rounded-full bg-indigo-500/20"></span>
                    )}
                    <Volume2 className={`h-4 w-4 ${isSpeaking ? "animate-pulse" : ""}`} />
                  </button>
                </div>
              )}
            </div>
            
            <div className="bg-black/20 rounded-xl p-6 min-h-[120px] flex items-center justify-center">
              {translatedText ? (
                <p className="text-indigo-100 text-center text-lg leading-relaxed">{translatedText}</p>
              ) : (
                <p className="text-indigo-300/50 text-center italic">Translation will appear here</p>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <footer className="mt-auto py-6 backdrop-blur-md bg-black/20 border-t border-white/5">
        <div className="container mx-auto px-4 text-center">
          <p className="text-indigo-300/70 text-sm">TalkHands Express - Sign Language Translation Tool</p>
        </div>
      </footer>
    </div>
  );
}
