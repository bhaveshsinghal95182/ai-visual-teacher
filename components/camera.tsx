import React, { useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { Camera as CameraIcon, Loader2, RefreshCcw } from 'lucide-react';
import { analyzeImage } from '../services/gemini';
import { analyzePrompt } from '../services/gemini';
import { Solution } from './solution';
import { History } from './convo-history';
import { QueryBox } from './querybox';

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
        } catch (err) {
            setError('Failed to analyze image. Please try again.');
            console.error(err);
        } finally {
            setIsSolving(false);
        }
    };

    const handleNewQuery = async (query: string) => {
        setError('');
        setIsSolving(true);
        try {
            const result = await analyzePrompt(query);
            setSolution(result);
        } catch (err) {
            setError('Failed to process query. Please try again.');
            console.error(err);
        } finally {
            setIsSolving(false);
        }
    };

    const toggleCamera = () => {
        setFacingMode((prevMode) => (prevMode === 'user' ? 'environment' : 'user'));
    };

    return (
        <div className="flex flex-col items-center gap-6 w-full max-w-4xl mx-auto">
            <div className="relative w-full h-[75vh] rounded-lg overflow-hidden bg-gray-900 shadow-lg flex-grow">
                <Webcam
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    className="w-full h-full object-cover sm:object-contain"
                    videoConstraints={{
                        ...WEBCAM_CONFIG,
                        facingMode,
                    }}
                />
            </div>

            {/* Buttons Container */}
            <div className="flex flex-col gap-4 w-full justify-center sm:flex-row sm:gap-6 sm:w-auto sm:px-4">
                <button
                    onClick={toggleCamera}
                    className="inline-flex h-12 animate-shimmer items-center justify-center rounded-md border border-white bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] px-6 font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50">
                    <RefreshCcw className="w-5 h-5" />
                    Toggle Camera
                </button>
                <button
                    onClick={() => handleCapture('explain_like_five')}
                    disabled={isSolving}
                    className="inline-flex h-12 animate-shimmer items-center justify-center rounded-md border border-white bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] px-6 font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50">
                    {isSolving ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Solving...
                        </>
                    ) : (
                        <>
                            <CameraIcon className="w-5 h-5" />
                            Explain Like I am 5
                        </>
                    )}
                </button>
                <button
                    onClick={() => handleCapture('step_by_step')}
                    disabled={isSolving}
                    className="inline-flex h-12 animate-shimmer items-center justify-center rounded-md border border-white bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] px-6 font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50">
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

            <QueryBox onNewQuery={handleNewQuery} />

            <div className="mt-6 sm:mt-0">
                {error && (
                    <div className="w-full bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-600">{error}</p>
                    </div>
                )}

                {solution && !error && (
                    <Solution
                        solution={solution}
                        isSpeaking={isSpeaking}
                        onToggleSpeech={setIsSpeaking}
                    />
                )}
            </div>
            <History />
        </div>
    );
}
