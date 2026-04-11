'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import { MeshCentralService } from '../lib/api';
import { Spinner } from './ui/SystemUI';

export const TerminalModal = ({ device, onClose }: { device: any; onClose: () => void }) => {
    const terminalRef = useRef<HTMLDivElement>(null);
    const socketRef = useRef<WebSocket | null>(null);
    const terminalInstance = useRef<Terminal | null>(null);
    const fitAddonRef = useRef<FitAddon | null>(null);
    const onCloseRef = useRef(onClose);
    const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

    onCloseRef.current = onClose;

    useEffect(() => {
        let isMounted = true;
        let rafId: number | null = null;

        const container = terminalRef.current;
        if (!container) return;

        const term = new Terminal({
            cursorBlink: true,
            fontSize: 14,
            fontFamily: 'Menlo, Monaco, "Courier New", monospace',
            theme: {
                background: '#000000',
                foreground: '#4ade80',
                cursor: '#4ade80',
                selectionBackground: '#ffffff40',
            },
            allowProposedApi: true,
            scrollback: 5000,
        });

        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);
        terminalInstance.current = term;
        fitAddonRef.current = fitAddon;

        term.open(container);

        const doFit = () => {
            if (!isMounted) return;
            rafId = requestAnimationFrame(() => {
                if (!isMounted) return;
                try {
                    if (container.clientWidth > 0 && container.clientHeight > 0) {
                        fitAddon.fit();
                    }
                } catch (_) { }
            });
        };

        const resizeObserver = new ResizeObserver(doFit);
        resizeObserver.observe(container);

        doFit();

        const wsUrl = MeshCentralService.getWsUrl(device.nodeid, 'terminal');
        const ws = new WebSocket(wsUrl);
        ws.binaryType = 'arraybuffer';
        socketRef.current = ws;

        ws.onopen = () => {
            if (!isMounted) return;
            setStatus('ready');
            term.write('\r\n\x1b[32m[SYSTEM]: SECURE SHELL ESTABLISHED\x1b[0m\r\n');
            doFit();
        };

        ws.onmessage = (event) => {
            if (event.data instanceof ArrayBuffer) {
                term.write(new Uint8Array(event.data));
            } else {
                term.write(event.data);
            }
        };

        ws.onerror = () => {
            if (isMounted) setStatus('error');
        };

        ws.onclose = () => {
            if (isMounted) {
                term.write('\r\n\x1b[31m[SYSTEM]: CONNECTION CLOSED\x1b[0m\r\n');
                onCloseRef.current();
            }
        };

        term.onData((data: string) => {
            if (ws.readyState === WebSocket.OPEN) ws.send(data);
        });

        return () => {
            isMounted = false;
            if (rafId !== null) cancelAnimationFrame(rafId);
            resizeObserver.disconnect();
            if (socketRef.current) {
                socketRef.current.onclose = null;
                socketRef.current.onerror = null;
                socketRef.current.close();
            }
            term.dispose();
        };
    }, [device.nodeid]);

    const handleDisconnect = () => {
        if (socketRef.current) {
            socketRef.current.onclose = null;
            socketRef.current.onerror = null;
            socketRef.current.close();
        }
        onCloseRef.current();
    };

    return (
        <div className="fixed inset-0 z-[100] flex flex-col bg-black" style={{ overflow: 'hidden' }}>
            <div className="bg-gray-900 px-6 py-3 border-b border-gray-800 flex justify-between items-center z-10 flex-shrink-0">
                <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${status === 'ready' ? 'bg-emerald-500 animate-pulse' : status === 'error' ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
                    <h3 className="font-bold text-white text-sm tracking-tight">Remote Terminal — {device.name}</h3>
                </div>
                <button onClick={handleDisconnect} className="px-3 py-1 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white text-xs font-bold rounded-lg transition-all border border-red-500/20">Disconnect</button>
            </div>

            <div className="relative bg-black" style={{ flex: '1 1 0', minHeight: 0, overflow: 'hidden' }}>
                {status === 'loading' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/80 gap-4">
                        <Spinner />
                        <span className="text-gray-400 text-sm font-mono">Negotiating Stream...</span>
                    </div>
                )}
                <div
                    ref={terminalRef}
                    style={{ width: '100%', height: '100%', overflow: 'hidden' }}
                />
                <style dangerouslySetInnerHTML={{
                    __html: `
                    .xterm { width: 100% !important; height: 100% !important; padding: 0 !important; }
                    .xterm-screen { width: 100% !important; height: 100% !important; }
                    .xterm-viewport { width: 100% !important; height: 100% !important; }
                    .xterm-viewport::-webkit-scrollbar { width: 8px; }
                    .xterm-viewport::-webkit-scrollbar-track { background: #000; }
                    .xterm-viewport::-webkit-scrollbar-thumb { background: #374151; border-radius: 4px; }
                    .xterm-viewport::-webkit-scrollbar-thumb:hover { background: #4b5563; }
                `}} />
            </div>
        </div>
    );
};