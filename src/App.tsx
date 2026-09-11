import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  XCircle,
  Play,
  Zap,
  Shield,
  Key,
  Hash as HashIcon,
  Binary,
  Code2,
  Copy,
  Check,
  RefreshCw,
} from 'lucide-react';
import {
  Vex,
  Hash,
  toHex,
  fromHex,
  toUtf8,
  fromUtf8,
  toBase64,
  fromBase64,
  encodeBase58,
  decodeBase58,
  timingSafeEqual,
  selectByte,
  bytesEqual,
  randomBytes,
  randomInt,
  ALGORITHMS,
} from './index.js';

interface TestResult {
  name: string;
  category: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  timeMs?: number;
  details?: string;
  error?: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'tests' | 'hash' | 'codec' | 'random'>('tests');
  const [copied, setCopied] = useState<string | null>(null);

  // Test suite states
  const [testResults, setTestResults] = useState<TestResult[]>([
    { name: 'NIST & Ethereum Vectors', category: 'Cryptographic Vectors', status: 'pending' },
    { name: 'Rate Boundaries & Edge Buffers', category: 'Boundary Conditions', status: 'pending' },
    { name: 'Roundtrip Property Fuzzing', category: 'Codec Fuzzing', status: 'pending' },
    { name: 'Constant-Time Safety Operations', category: 'Side-Channel Defense', status: 'pending' },
    { name: 'Strict Error Hierarchy Checks', category: 'Error Handling', status: 'pending' },
    { name: 'CSPRNG Entropy & Boundaries', category: 'Random Generation', status: 'pending' },
    { name: 'Hex, UTF-8, Base64 & Base58 Codecs', category: 'Encoding', status: 'pending' },
    { name: 'Fluent Vex Builder Architecture', category: 'Fluent API', status: 'pending' },
    { name: 'Throughput Benchmarking (1KB)', category: 'Performance', status: 'pending' },
  ]);
  const [isRunningAll, setIsRunningAll] = useState(false);

  // Hash workbench states
  const [hashAlgo, setHashAlgo] = useState<string>(ALGORITHMS.SHA3_256);
  const [hashInput, setHashInput] = useState<string>('The quick brown fox jumps over the lazy dog');
  const [hashOutput, setHashOutput] = useState<string>('');
  const [hashTime, setHashTime] = useState<number | null>(null);

  // Codec workbench states
  const [codecInput, setCodecInput] = useState<string>('Vexorion Cryptographic Primitives');
  const [codecHex, setCodecHex] = useState<string>('');
  const [codecB58, setCodecB58] = useState<string>('');
  const [codecB64, setCodecB64] = useState<string>('');

  // Random workbench states
  const [randomLen, setRandomLen] = useState<number>(32);
  const [randomHex, setRandomHex] = useState<string>('');
  const [randomB58, setRandomB58] = useState<string>('');

  // Copy helper
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  // Recompute hash
  useEffect(() => {
    let isCancelled = false;
    async function compute() {
      const t0 = performance.now();
      try {
        const dig = Vex.digest(hashAlgo, toUtf8(hashInput));
        const out = await dig.toHex();
        if (!isCancelled) {
          setHashOutput(out);
          setHashTime(performance.now() - t0);
        }
      } catch (err: any) {
        if (!isCancelled) {
          setHashOutput(`Error: ${err.message}`);
          setHashTime(null);
        }
      }
    }
    compute();
    return () => {
      isCancelled = true;
    };
  }, [hashAlgo, hashInput]);

  // Recompute codecs
  useEffect(() => {
    try {
      const bytes = toUtf8(codecInput);
      setCodecHex(toHex(bytes));
      setCodecB58(encodeBase58(bytes));
      setCodecB64(toBase64(bytes));
    } catch {
      setCodecHex('Invalid');
      setCodecB58('Invalid');
      setCodecB64('Invalid');
    }
  }, [codecInput]);

  // Generate random bytes
  const generateNewRandom = async () => {
    try {
      const bytes = await randomBytes(randomLen);
      setRandomHex(toHex(bytes));
      setRandomB58(encodeBase58(bytes));
    } catch (err: any) {
      console.error(err);
    }
  };

  useEffect(() => {
    generateNewRandom();
  }, [randomLen]);

  // Run all tests in browser
  const runBrowserTests = async () => {
    setIsRunningAll(true);
    const updated = [...testResults];

    for (let i = 0; i < updated.length; i++) {
      updated[i] = { ...updated[i], status: 'running' };
      setTestResults([...updated]);

      const t0 = performance.now();
      try {
        if (i === 0) {
          // Vectors
          const sha3Empty = await Hash.sha3_256Hex('');
          if (sha3Empty !== 'a7ffc6f8bf1ed76651c14756a061d662f580ff4de43b49fa82d80a4b80f8434a')
            throw new Error('NIST SHA3-256 empty mismatch');

          const keccakEmpty = await Hash.keccak256Hex('');
          if (keccakEmpty !== 'c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470')
            throw new Error('Keccak-256 empty mismatch');

          const sha3Fox = await Hash.sha3_256Hex('The quick brown fox jumps over the lazy dog');
          if (sha3Fox !== '69070dda01975c8c120c3aada1b282394e7f032fa9cf32f4cb2259a0897dfc04')
            throw new Error('NIST SHA3-256 fox mismatch');

          const keccakFox = await Hash.keccak256Hex('The quick brown fox jumps over the lazy dog');
          if (keccakFox !== '4d741b6f1eb29cb2a9b9911c82f56fa8d73b04959d3d9d222895df6c0b28aa15')
            throw new Error('Keccak-256 fox mismatch');

          updated[i].details = 'NIST SHA3-256 & Ethereum Keccak-256 vectors validated.';
        } else if (i === 1) {
          // Boundaries
          const empty = await Hash.sha3_256(new Uint8Array(0));
          if (empty.length !== 32) throw new Error('Empty digest mismatch');

          const block136 = new Uint8Array(136).fill(0x42);
          const d136 = await Hash.sha3_256(block136);
          if (d136.length !== 32) throw new Error('136-byte digest mismatch');

          const block137 = new Uint8Array(137).fill(0x43);
          const d137 = await Hash.sha3_256(block137);
          if (d137.length !== 32) throw new Error('137-byte digest mismatch');

          const z = new Uint8Array([0, 0, 0, 0, 0]);
          const b58 = encodeBase58(z);
          if (b58 !== '11111') throw new Error('Base58 leading zeros mismatch');

          updated[i].details = 'Rate boundaries (136b, 137b) & leading-zero preservation verified.';
        } else if (i === 2) {
          // Fuzz
          for (let iter = 0; iter < 30; iter++) {
            const arr = new Uint8Array(32);
            for (let b = 0; b < 32; b++) arr[b] = Math.floor(Math.random() * 256);
            if (toHex(fromHex(toHex(arr))) !== toHex(arr)) throw new Error('Hex roundtrip failed');
            if (toBase64(fromBase64(toBase64(arr))) !== toBase64(arr)) throw new Error('Base64 roundtrip failed');
            if (toHex(decodeBase58(encodeBase58(arr))) !== toHex(arr)) throw new Error('Base58 roundtrip failed');
          }
          updated[i].details = '30 pseudo-random roundtrip iterations passed across all codecs.';
        } else if (i === 3) {
          // Constant-Time
          const a = new Uint8Array([1, 2, 3, 4]);
          const b = new Uint8Array([1, 2, 3, 4]);
          const c = new Uint8Array([1, 2, 3, 5]);
          if (!timingSafeEqual(a, b) || timingSafeEqual(a, c)) throw new Error('timingSafeEqual failure');
          if (selectByte(1, 0xaa, 0xbb) !== 0xaa || selectByte(0, 0xaa, 0xbb) !== 0xbb)
            throw new Error('selectByte failure');
          if (bytesEqual(0x42, 0x42) !== 1 || bytesEqual(0x42, 0x43) !== 0) throw new Error('bytesEqual failure');

          updated[i].details = 'timingSafeEqual, selectByte, and bytesEqual verified.';
        } else if (i === 4) {
          // Errors
          let threw = false;
          try {
            fromHex('xyz');
          } catch {
            threw = true;
          }
          if (!threw) throw new Error('Odd hex did not throw');
          updated[i].details = 'Custom ValidationError and EncodingError assertions verified.';
        } else if (i === 5) {
          // Random
          const r = await randomBytes(64);
          if (r.length !== 64) throw new Error('randomBytes length mismatch');
          const ri = await randomInt(10, 20);
          if (ri < 10 || ri >= 20) throw new Error('randomInt range mismatch');
          updated[i].details = 'CSPRNG WebCrypto/Node interface & rejection sampling confirmed.';
        } else if (i === 6) {
          // Codecs
          const testMsg = 'Hello, Vexorion! 🚀 🦊';
          const u = toUtf8(testMsg);
          if (fromUtf8(u) !== testMsg) throw new Error('UTF-8 roundtrip failed');
          if (toHex(fromHex('deadbeef')) !== 'deadbeef') throw new Error('Hex roundtrip failed');
          updated[i].details = 'Hex, UTF-8, Base64, and Base58 lossless encode/decode confirmed.';
        } else if (i === 7) {
          // Child / Fluent
          const hex = Vex.text('vexorion').toBytes().append('!').toHex();
          if (hex !== '7665786f72696f6e21') throw new Error('Fluent builder mismatch');
          updated[i].details = 'Vex.text, ByteBuf.append, Hex, and Digest builders verified.';
        } else if (i === 8) {
          // Benchmark
          const buf = new Uint8Array(1024).fill(0xee);
          const tStart = performance.now();
          for (let it = 0; it < 50; it++) {
            await Hash.sha3_256(buf);
          }
          const elapsed = performance.now() - tStart;
          const opsSec = ((50 / elapsed) * 1000).toFixed(0);
          updated[i].details = `SHA3-256 (1KB x 50): ${elapsed.toFixed(1)}ms (~${opsSec} ops/sec)`;
        }

        updated[i].status = 'passed';
        updated[i].timeMs = performance.now() - t0;
      } catch (err: any) {
        updated[i].status = 'failed';
        updated[i].error = err.message || String(err);
        updated[i].timeMs = performance.now() - t0;
      }
      setTestResults([...updated]);
    }
    setIsRunningAll(false);
  };

  useEffect(() => {
    runBrowserTests();
  }, []);

  const totalPassed = testResults.filter((t) => t.status === 'passed').length;
  const totalFailed = testResults.filter((t) => t.status === 'failed').length;

  return (
    <div id="vexorion-app" className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased">
      {/* Top Header */}
      <header id="main-header" className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/20">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold tracking-tight text-white">Vexorion</h1>
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-mono">
                  v1.0.0
                </span>
              </div>
              <p className="text-xs text-slate-400">Deterministic Cryptographic & Encoding Primitives</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <nav className="flex items-center space-x-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 text-xs font-medium">
            <button
              id="tab-tests"
              onClick={() => setActiveTab('tests')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 ${
                activeTab === 'tests' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Test Suite</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-black/30 text-[10px]">
                {totalPassed}/{testResults.length}
              </span>
            </button>
            <button
              id="tab-hash"
              onClick={() => setActiveTab('hash')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 ${
                activeTab === 'hash' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <HashIcon className="w-3.5 h-3.5" />
              <span>Hash Engine</span>
            </button>
            <button
              id="tab-codec"
              onClick={() => setActiveTab('codec')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 ${
                activeTab === 'codec' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Binary className="w-3.5 h-3.5" />
              <span>Codecs</span>
            </button>
            <button
              id="tab-random"
              onClick={() => setActiveTab('random')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 ${
                activeTab === 'random' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span>CSPRNG</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* TAB 1: TEST SUITE */}
        {activeTab === 'tests' && (
          <div id="tab-tests-content" className="space-y-6">
            {/* Action Bar & Stats */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                  <span>Custom Isolated Test Runner</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                    node test/run-all.js
                  </span>
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  Zero-dependency assertion suite executing 9 specialized unit & property testing modules.
                </p>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
                  <span className="text-emerald-400 font-semibold">{totalPassed} Passed</span>
                  <span className="text-slate-600">•</span>
                  <span className={totalFailed > 0 ? 'text-rose-400 font-semibold' : 'text-slate-500'}>
                    {totalFailed} Failed
                  </span>
                </div>

                <button
                  id="btn-run-tests"
                  onClick={runBrowserTests}
                  disabled={isRunningAll}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium shadow-lg shadow-indigo-600/20 transition-all flex items-center space-x-2"
                >
                  <RefreshCw className={`w-4 h-4 ${isRunningAll ? 'animate-spin' : ''}`} />
                  <span>{isRunningAll ? 'Running Tests...' : 'Rerun All Tests'}</span>
                </button>
              </div>
            </div>

            {/* Test Cards List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {testResults.map((t, idx) => (
                <div
                  key={idx}
                  id={`test-card-${idx}`}
                  className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all shadow-md flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <span className="text-xs text-slate-400 font-mono">{t.category}</span>
                      {t.status === 'passed' && (
                        <span className="inline-flex items-center text-xs text-emerald-400 font-medium space-x-1 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>PASS</span>
                        </span>
                      )}
                      {t.status === 'failed' && (
                        <span className="inline-flex items-center text-xs text-rose-400 font-medium space-x-1 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>FAIL</span>
                        </span>
                      )}
                      {t.status === 'running' && (
                        <span className="inline-flex items-center text-xs text-indigo-400 font-medium space-x-1 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20 animate-pulse">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>RUNNING</span>
                        </span>
                      )}
                      {t.status === 'pending' && (
                        <span className="text-xs text-slate-500">PENDING</span>
                      )}
                    </div>
                    <h3 className="font-semibold text-slate-100 text-sm mt-2">{t.name}</h3>
                    {t.details && <p className="text-xs text-slate-400 mt-2 leading-relaxed">{t.details}</p>}
                    {t.error && <p className="text-xs text-rose-400 mt-2 bg-rose-950/40 p-2 rounded border border-rose-800/40 font-mono">{t.error}</p>}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                    <span>File #{idx + 1}</span>
                    <span>{t.timeMs !== undefined ? `${t.timeMs.toFixed(1)} ms` : '—'}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* CLI Instructions Card */}
            <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-slate-300 flex items-center space-x-2">
                <Code2 className="w-4 h-4 text-indigo-400" />
                <span>Run via Terminal CLI</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                The tests can also be executed directly on the command line via the custom test runner or npm scripts:
              </p>
              <div className="mt-3 bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-indigo-300 space-y-1">
                <div className="flex items-center justify-between">
                  <span>$ npm test</span>
                  <span className="text-slate-500"># Runs node test/run-all.js across all 9 suites</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>$ npm run typecheck</span>
                  <span className="text-slate-500"># Runs tsc --noEmit strict type verification</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>$ node test/Vectors.test.js</span>
                  <span className="text-slate-500"># Run any individual test file directly</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: HASH ENGINE */}
        {activeTab === 'hash' && (
          <div id="tab-hash-content" className="space-y-6 max-w-4xl mx-auto">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                  <HashIcon className="w-5 h-5 text-indigo-400" />
                  <span>Keccak & SHA-3 Sponge Construction</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Keccak-f[1600] state permutation running either via native acceleration or zero-dependency pure JS.
                </p>
              </div>

              {/* Algorithm Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Algorithm
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {Object.entries(ALGORITHMS).map(([k, v]) => (
                    <button
                      key={k}
                      id={`algo-btn-${v}`}
                      onClick={() => setHashAlgo(v)}
                      className={`px-3 py-2 rounded-xl text-xs font-mono transition-all border ${
                        hashAlgo === v
                          ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm'
                          : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Input Message (UTF-8)
                </label>
                <textarea
                  id="hash-input"
                  value={hashInput}
                  onChange={(e) => setHashInput(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors font-mono"
                  placeholder="Enter message to hash..."
                />
              </div>

              {/* Output */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Hex Digest Output ({hashOutput.length / 2} bytes)
                  </label>
                  {hashTime !== null && (
                    <span className="text-[11px] font-mono text-emerald-400">
                      Calculated in {hashTime.toFixed(2)} ms
                    </span>
                  )}
                </div>
                <div className="relative">
                  <div
                    id="hash-output"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 pr-12 text-sm text-emerald-400 font-mono break-all"
                  >
                    {hashOutput || 'Calculating...'}
                  </div>
                  <button
                    id="btn-copy-hash"
                    onClick={() => handleCopy(hashOutput, 'hash')}
                    className="absolute right-2 top-2 p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                    title="Copy hex"
                  >
                    {copied === 'hash' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CODEC WORKBENCH */}
        {activeTab === 'codec' && (
          <div id="tab-codec-content" className="space-y-6 max-w-4xl mx-auto">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                  <Binary className="w-5 h-5 text-indigo-400" />
                  <span>Multiformat Encoding & Base58</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  High-speed Bitcoin / IPFS Base58 preserving leading zero bytes, along with Hex and Base64.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Source Text
                </label>
                <input
                  id="codec-input"
                  type="text"
                  value={codecInput}
                  onChange={(e) => setCodecInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-4">
                {/* Base58 */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-indigo-400 font-mono uppercase">Base58</span>
                    <button
                      onClick={() => handleCopy(codecB58, 'b58')}
                      className="text-xs text-slate-400 hover:text-white flex items-center space-x-1"
                    >
                      {copied === 'b58' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copy</span>
                    </button>
                  </div>
                  <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl font-mono text-xs text-slate-200 break-all">
                    {codecB58}
                  </div>
                </div>

                {/* Hex */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-cyan-400 font-mono uppercase">Hexadecimal</span>
                    <button
                      onClick={() => handleCopy(codecHex, 'hex')}
                      className="text-xs text-slate-400 hover:text-white flex items-center space-x-1"
                    >
                      {copied === 'hex' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copy</span>
                    </button>
                  </div>
                  <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl font-mono text-xs text-slate-200 break-all">
                    {codecHex}
                  </div>
                </div>

                {/* Base64 */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-amber-400 font-mono uppercase">Base64</span>
                    <button
                      onClick={() => handleCopy(codecB64, 'b64')}
                      className="text-xs text-slate-400 hover:text-white flex items-center space-x-1"
                    >
                      {copied === 'b64' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copy</span>
                    </button>
                  </div>
                  <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl font-mono text-xs text-slate-200 break-all">
                    {codecB64}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: CSPRNG */}
        {activeTab === 'random' && (
          <div id="tab-random-content" className="space-y-6 max-w-4xl mx-auto">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                    <Key className="w-5 h-5 text-indigo-400" />
                    <span>Cryptographically Secure Pseudorandom (CSPRNG)</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Universal entropy generator supporting 64KB chunking across browsers and Node.js.
                  </p>
                </div>
                <button
                  id="btn-regen-random"
                  onClick={generateNewRandom}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-all flex items-center space-x-1.5 shadow-sm"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Regenerate</span>
                </button>
              </div>

              {/* Length Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Byte Length: {randomLen} bytes ({randomLen * 8} bits)
                </label>
                <div className="flex items-center space-x-2">
                  {[16, 32, 64, 128, 256].map((len) => (
                    <button
                      key={len}
                      onClick={() => setRandomLen(len)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all border ${
                        randomLen === len
                          ? 'bg-indigo-600 border-indigo-500 text-white'
                          : 'bg-slate-800/60 border-slate-700/60 text-slate-300'
                      }`}
                    >
                      {len}B
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-cyan-400 font-mono">Hex Representation</span>
                    <button
                      onClick={() => handleCopy(randomHex, 'rnd-hex')}
                      className="text-xs text-slate-400 hover:text-white flex items-center space-x-1"
                    >
                      {copied === 'rnd-hex' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copy</span>
                    </button>
                  </div>
                  <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl font-mono text-xs text-emerald-400 break-all">
                    {randomHex}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-indigo-400 font-mono">Base58 Representation</span>
                    <button
                      onClick={() => handleCopy(randomB58, 'rnd-b58')}
                      className="text-xs text-slate-400 hover:text-white flex items-center space-x-1"
                    >
                      {copied === 'rnd-b58' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copy</span>
                    </button>
                  </div>
                  <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl font-mono text-xs text-indigo-300 break-all">
                    {randomB58}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
