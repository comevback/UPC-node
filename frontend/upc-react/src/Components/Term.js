import React, { useEffect, useRef, useContext } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import './Term.css';
import io from 'socket.io-client';
import { ParaContext } from '../Global.js';

const Term = () => {
    const terminalRef = useRef(null);
    const terminal = useRef(null);
    const fitAddon = useRef(new FitAddon());
    const socket = useRef(null);
    const { API_URL } = useContext(ParaContext);
    

    useEffect(() => {
        requestAnimationFrame(() => {
            console.log("Terminal is being rendered")
            socket.current = io(API_URL);
            terminal.current = new Terminal({
                FontWeight: '900', // font weight
                cursorBlink: true,     // cursor blinking
                cursorStyle: 'block',    // style（'block', 'underline', 'bar'）
                cursorInactiveStyle: 'block', // inactive cursor style
                fontSize: 15,          // font size
                fontFamily: 'monospace', // font family
                cols: 200,
                rows: 40,
                });
            terminal.current.loadAddon(fitAddon.current);
            terminal.current.open(terminalRef.current);
            setTimeout(() => {fitAddon.current.fit()}, 100);

            socket.current.on('output', (data) => {
                terminal.current.write(data);
            });

            terminal.current.onData((data) => {
                socket.current.emit('input', data);
            });

            return () => {
                terminal.current.dispose();
                socket.current.disconnect();
            };
        });
    }, []);

    return (
            <div id='terminal' ref={terminalRef}/>    
    );
};

export default Term;

