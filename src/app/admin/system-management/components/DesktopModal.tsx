'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MeshCentralService } from '../lib/api';
import { Spinner } from './ui/SystemUI';

export const DesktopModal = ({ device, onClose }: { device: any; onClose: () => void }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const socketRef = useRef<WebSocket | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const onCloseRef = useRef(onClose);
    const buttonMaskRef = useRef<number>(0);
    const [connecting, setConnecting] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const screenWRef = useRef(0);
    const screenHRef = useRef(0);

    onCloseRef.current = onClose;

    const scaleCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container || !screenWRef.current || !screenHRef.current) return;

        const cW = container.clientWidth;
        const cH = container.clientHeight;
        const sW = screenWRef.current;
        const sH = screenHRef.current;
        const scale = Math.min(cW / sW, cH / sH);

        canvas.style.position = 'absolute';
        canvas.style.left = `${Math.floor((cW - sW * scale) / 2)}px`;
        canvas.style.top = `${Math.floor((cH - sH * scale) / 2)}px`;
        canvas.style.width = `${Math.floor(sW * scale)}px`;
        canvas.style.height = `${Math.floor(sH * scale)}px`;
    }, []);

    const handleKeyEvent = useCallback((e: KeyboardEvent, type: 'keydown' | 'keyup') => {
        if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;

        const preventKeys = ['Tab', 'Alt', 'Control', 'Shift', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12'];
        if (preventKeys.includes(e.key)) e.preventDefault();

        const buf = new ArrayBuffer(10);
        const view = new DataView(buf);
        view.setUint16(0, 1, false);
        view.setUint16(2, 10, false);
        view.setUint8(4, type === 'keydown' ? 1 : 0);
        view.setUint16(6, e.keyCode || e.which, false);
        socketRef.current.send(buf);
    }, []);

    useEffect(() => {
        let isMounted = true;

        const wsUrl = MeshCentralService.getWsUrl(device.nodeid, 'desktop');
        const ws = new WebSocket(wsUrl);
        ws.binaryType = 'arraybuffer';
        socketRef.current = ws;

        ws.onopen = () => {
            if (!isMounted) return;
            setConnecting(false);

            const buf = new ArrayBuffer(10);
            const view = new DataView(buf);
            view.setUint16(0, 5, false);
            view.setUint16(2, 10, false);
            view.setUint8(4, 1);
            view.setUint8(5, 100);
            view.setUint16(6, 1024, false);
            view.setUint16(8, 20, false);
            ws.send(buf);
        };

        ws.onmessage = (event) => {
            if (typeof event.data === 'string') return;

            const data = new Uint8Array(event.data);
            if (data.length < 4) return;

            const canvas = canvasRef.current;
            if (!canvas) return;

            const view = new DataView(event.data);
            const cmd = view.getUint16(0, false);

            if (cmd === 7) {
                const w = view.getUint16(4, false);
                const h = view.getUint16(6, false);
                if (w < 1 || h < 1) return;
                screenWRef.current = w;
                screenHRef.current = h;

                canvas.width = w;
                canvas.height = h;

                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.fillStyle = 'black';
                    ctx.fillRect(0, 0, w, h);
                }
                scaleCanvas();
                return;
            }

            if ((cmd === 3 || cmd === 4) && data.length > 8) {
                const tileX = view.getUint16(4, false);
                const tileY = view.getUint16(6, false);
                const blob = new Blob([data.subarray(8)], { type: 'image/jpeg' });

                createImageBitmap(blob).then((bitmap) => {
                    const ctx = canvas.getContext('2d', { alpha: false });
                    if (!ctx) { bitmap.close(); return; }

                    if (canvas.width < 2 || canvas.height < 2) {
                        canvas.width = tileX + bitmap.width;
                        canvas.height = tileY + bitmap.height;
                        screenWRef.current = canvas.width;
                        screenHRef.current = canvas.height;
                        scaleCanvas();
                    }

                    ctx.drawImage(bitmap, tileX, tileY);
                    bitmap.close();
                }).catch(() => { });
            }
        };

        ws.onerror = () => {
            if (isMounted) {
                setError('Connection lost or unreachable.');
                setConnecting(false);
            }
        };

        ws.onclose = () => {
            if (isMounted) {
                setConnecting(false);
                setError('Remote desktop connection closed.');
            }
        };

        const handleKeyDown = (e: KeyboardEvent) => handleKeyEvent(e, 'keydown');
        const handleKeyUp = (e: KeyboardEvent) => handleKeyEvent(e, 'keyup');
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        const resizeObserver = new ResizeObserver(() => scaleCanvas());
        if (containerRef.current) resizeObserver.observe(containerRef.current);

        return () => {
            isMounted = false;
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            resizeObserver.disconnect();
            if (socketRef.current) {
                socketRef.current.onclose = null;
                socketRef.current.onerror = null;
                socketRef.current.close();
            }
        };
    }, [device.nodeid, handleKeyEvent, scaleCanvas]);

    const getCanvasCoords = (e: React.MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        return {
            x: Math.floor((e.clientX - rect.left) * scaleX),
            y: Math.floor((e.clientY - rect.top) * scaleY),
        };
    };

    const sendMousePacket = (x: number, y: number, mask: number) => {
        if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;
        const buf = new ArrayBuffer(10);
        const view = new DataView(buf);
        view.setUint16(0, 2, false);
        view.setUint16(2, 10, false);
        view.setUint8(4, mask);
        view.setUint16(6, x, false);
        view.setUint16(8, y, false);
        socketRef.current.send(buf);
    };

    const buttonBit = (btn: number) => btn === 0 ? 1 : btn === 1 ? 2 : btn === 2 ? 4 : 0;

    const handleMouseDown = (e: React.MouseEvent) => {
        buttonMaskRef.current |= buttonBit(e.button);
        const { x, y } = getCanvasCoords(e);
        sendMousePacket(x, y, buttonMaskRef.current);
    };

    const handleMouseUp = (e: React.MouseEvent) => {
        buttonMaskRef.current &= ~buttonBit(e.button);
        const { x, y } = getCanvasCoords(e);
        sendMousePacket(x, y, buttonMaskRef.current);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        const { x, y } = getCanvasCoords(e);
        sendMousePacket(x, y, buttonMaskRef.current);
    };

    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        const { x, y } = getCanvasCoords(e as unknown as React.MouseEvent);
        const scrollBit = e.deltaY < 0 ? 8 : 16;
        sendMousePacket(x, y, buttonMaskRef.current | scrollBit);
        sendMousePacket(x, y, buttonMaskRef.current);
    };

    const handleDisconnect = () => {
        if (socketRef.current) {
            socketRef.current.onclose = null;
            socketRef.current.onerror = null;
            socketRef.current.close();
        }
        onCloseRef.current();
    };

    return (
        <div className="fixed inset-0 z-[100] flex flex-col bg-black" onContextMenu={(e) => e.preventDefault()}>
            <div className="bg-gray-900 px-6 py-3 border-b border-gray-800 flex justify-between items-center z-10 flex-shrink-0">
                <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${connecting ? 'bg-yellow-500' : error ? 'bg-red-500' : 'bg-emerald-500 animate-pulse'}`}></div>
                    <h3 className="font-bold text-white text-sm tracking-tight">Remote Desktop — {device.name}</h3>
                </div>
                <button onClick={handleDisconnect} className="px-3 py-1 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white text-xs font-bold rounded-lg transition-all border border-red-500/20">Disconnect</button>
            </div>

            <div
                ref={containerRef}
                className="bg-black"
                style={{ flex: '1 1 0', minHeight: 0, position: 'relative', overflow: 'hidden' }}
                onWheel={handleWheel}
            >
                {connecting && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/80 gap-4">
                        <Spinner />
                        <span className="text-gray-400 text-sm font-mono">Negotiating Stream...</span>
                    </div>
                )}
                {error && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/80 gap-2">
                        <span className="text-red-400 text-sm font-mono">{error}</span>
                    </div>
                )}
                <canvas
                    ref={canvasRef}
                    className="cursor-crosshair"
                    style={{ display: 'block', outline: 'none', imageRendering: 'auto' }}
                    tabIndex={0}
                    onMouseMove={handleMouseMove}
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                />
            </div>
        </div>
    );
};