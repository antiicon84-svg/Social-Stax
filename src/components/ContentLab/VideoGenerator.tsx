import React, { useState, useEffect, useRef } from 'react';
import { generateVideo } from '~/services/aiService';
import { Loader2, Video, Download, RefreshCw, AlertCircle } from 'lucide-react';

interface VideoGeneratorProps {
  credits: number;
  onRefresh: () => void;
}

const ASPECT_RATIOS = [
  { label: '16:9 (Landscape)', value: '16:9' },
  { label: '9:16 (Portrait / Reels)', value: '9:16' },
  { label: '1:1 (Square)', value: '1:1' },
];

export default function VideoGenerator({ credits, onRefresh }: VideoGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [loading, setLoading] = useState(false);
  const [videoData, setVideoData] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (loading) {
      setElapsed(0);
      timerRef.current = setInterval(() => setElapsed(s => s + 1), 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loading]);

  const formatElapsed = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError('');
    setVideoData(null);
    try {
      const result = await generateVideo(prompt.trim(), aspectRatio);
      setVideoData(result.videoData);
      onRefresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Video generation failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!videoData) return;
    const a = document.createElement('a');
    a.href = videoData;
    a.download = `generated-video-${Date.now()}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleReset = () => {
    setVideoData(null);
    setError('');
    setPrompt('');
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <div className="flex items-center gap-2 mb-4">
        <Video size={20} className="text-purple-400" />
        <h2 className="text-xl font-bold text-white">Video Generator</h2>
        <span className="ml-auto text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">
          Powered by Veo 3
        </span>
      </div>

      {!videoData ? (
        <>
          <div className="mb-4">
            <label className="block text-gray-300 text-sm font-medium mb-1">
              Video Prompt
            </label>
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="Describe the video you want to generate... (e.g. 'A cinematic drone shot of a city at sunset, golden hour lighting, 4K')"
              className="w-full p-3 rounded-lg bg-gray-700 text-white placeholder-gray-500 border border-gray-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50 resize-none h-32 text-sm"
              disabled={loading}
            />
          </div>

          <div className="mb-5">
            <label className="block text-gray-300 text-sm font-medium mb-1">
              Aspect Ratio
            </label>
            <div className="flex gap-2 flex-wrap">
              {ASPECT_RATIOS.map(ar => (
                <button
                  key={ar.value}
                  onClick={() => setAspectRatio(ar.value)}
                  disabled={loading}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    aspectRatio === ar.value
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {ar.label}
                </button>
              ))}
            </div>
          </div>

          {loading && (
            <div className="mb-4 p-4 bg-purple-900/20 border border-purple-700/40 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Loader2 size={18} className="animate-spin text-purple-400" />
                <span className="text-purple-300 font-medium text-sm">Generating your video with Veo 3…</span>
              </div>
              <p className="text-gray-400 text-xs mb-1">
                Video generation typically takes 2–5 minutes. Please don't close this tab.
              </p>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 bg-gray-700 rounded-full h-1.5">
                  <div
                    className="bg-purple-500 h-1.5 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min((elapsed / 300) * 100, 95)}%` }}
                  />
                </div>
                <span className="text-gray-400 text-xs tabular-nums">{formatElapsed(elapsed)}</span>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-700/50 rounded-lg flex items-start gap-2">
              <AlertCircle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={loading || credits < 1 || !prompt.trim()}
            className="w-full bg-gradient-to-r from-purple-600 to-red-600 hover:from-purple-500 hover:to-red-500 text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Generating… ({formatElapsed(elapsed)})
              </>
            ) : (
              <>
                <Video size={18} />
                Generate Video
              </>
            )}
          </button>

          {credits < 1 && !loading && (
            <p className="text-center text-red-400 text-xs mt-2">
              You don't have enough credits to generate a video.
            </p>
          )}
        </>
      ) : (
        <div>
          <video
            src={videoData}
            controls
            autoPlay
            className="w-full rounded-lg mb-4 bg-black"
            style={{ maxHeight: '480px' }}
          />
          <div className="flex gap-3">
            <button
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-medium py-2.5 rounded-lg transition-all text-sm"
            >
              <Download size={16} />
              Download MP4
            </button>
            <button
              onClick={handleReset}
              className="flex-1 flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-gray-300 font-medium py-2.5 rounded-lg transition-all text-sm"
            >
              <RefreshCw size={16} />
              Generate Another
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
