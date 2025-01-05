import React, { useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { Camera as CameraIcon, Loader2, RefreshCcw } from 'lucide-react';
import { analyzeImage } from '../services/gemini';
import { Solution } from './solution';
import { BackgroundGradient } from './ui/background-gradient';

const WEBCAM_CONFIG = {
    width: 1280,
    height: 720,
    screenshotQuality: 0.92,
};

export function Camera() {
    const webcamRef = useRef<Webcam>(null);
    const [solution, setSolution] = useState<string>('');
    const [isSolving, setIsSolving] = useState(false);
    const [error, setError] = useState<string>('');
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
    const [isPopupVisible, setIsPopupVisible] = useState(false);

    const handleCapture = async (mode: 'explain_like_five' | 'step_by_step') => {
        setError('');
        const imageSrc = webcamRef.current?.getScreenshot();
        if (!imageSrc) {
            setError('Failed to capture image. Please try again.');
            return;
        }

        setIsSolving(true);
        try {
            const result = await analyzeImage(imageSrc, mode);
            setSolution(result);
            setIsPopupVisible(true); // Show popup when a solution is available
        } catch (err) {
            setError('Failed to analyze image. Please try again.');
            console.error(err);
        } finally {
            setIsSolving(false);
        }
    };

    const toggleCamera = () => {
        setFacingMode((prevMode) => (prevMode === 'user' ? 'environment' : 'user'));
    };

    const closePopup = () => {
        setIsPopupVisible(false);
    };

    return (
        <div className="flex flex-col items-center gap-6 w-full max-w-4xl mx-auto">
            <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-900 shadow-lg">
                <Webcam
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    className="w-full h-full object-contain"
                    videoConstraints={{ ...WEBCAM_CONFIG, facingMode }}
                />
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4 flex-wrap justify-center w-full px-4">
                    <button
                        onClick={toggleCamera}
                        className="inline-flex h-12 animate-shimmer items-center justify-center rounded-full border border-slate-800 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] px-6 font-medium text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50"
                    >
                        <RefreshCcw className="w-5 h-5" />
                        Toggle Camera
                    </button>
                    <button
                        onClick={() => handleCapture('explain_like_five')}
                        disabled={isSolving}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full  items-center gap-2 whitespace-nowrap w-full sm:w-auto sm:px-8 disabled:opacity-50 disabled:cursor-not-allowed inline-flex h-12 animate-shimmer  justify-center  border border-slate-800 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%]  font-medium  transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50"
                    >
                        {isSolving ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Solving...
                            </>
                        ) : (
                            <>
                                <CameraIcon className="w-5 h-5" />
                                Explain Like 5
                            </>
                        )}
                    </button>
                    <button
                        onClick={() => handleCapture('step_by_step')}
                        disabled={isSolving}
                        className="py-3 rounded-full items-center gap-2 whitespace-nowrap w-full sm:w-auto sm:px-8 disabled:opacity-50 disabled:cursor-not-allowed inline-flex h-12 animate-shimmer justify-center border bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] px-6 font-medium text-white transition-colors focus:outline-none focus:ring-2  border-slate-800 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50"
                    >
                        {isSolving ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Solving...
                            </>
                        ) : (
                            <>
                                <CameraIcon className="w-5 h-5" />
                                Step by Step
                            </>
                        )}
                    </button>
                </div>
            </div>

            {error && (
                <div className="w-full bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-600">{error}</p>
                </div>
            )}

            {isPopupVisible && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <BackgroundGradient className="rounded-lg shadow-lg max-w-3xl w-full p-6 overflow-y-auto max-h-[80vh] relative bg-white dark:bg-zinc-900">
                        <button
                            onClick={closePopup}
                            className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
                        >
                            ✖
                        </button>
                        <Solution
                            solution={solution}
                            isSpeaking={isSpeaking}
                            onToggleSpeech={setIsSpeaking}
                        />
                    </BackgroundGradient>
                </div>
            )}

        </div>
    );
}
