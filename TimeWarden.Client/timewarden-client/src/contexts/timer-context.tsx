import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';

const STORAGE_KEY = 'tw_timer';

interface TimerState {
    startedAt: string | null;
    description: string;
    stoppedResult: {
        hours: number;
        description: string;
        date: string;
    } | null;
}

interface TimerContextType {
    isRunning: boolean;
    isStopped: boolean;
    elapsedSeconds: number;
    description: string;
    setDescription: (d: string) => void;
    start: () => void;
    stop: () => void;
    discard: () => void;
    stoppedResult: { hours: number; description: string; date: string } | null;
}

const defaultState: TimerState = {
    startedAt: null,
    description: '',
    stoppedResult: null,
};

function loadState(): TimerState {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw);
    } catch { /* ignore */ }
    return { ...defaultState };
}

function saveState(state: TimerState) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

const TimerContext = createContext<TimerContextType | null>(null);

export function TimerProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<TimerState>(loadState);
    const [elapsedSeconds, setElapsedSeconds] = useState(() =>
        state.startedAt
            ? Math.floor((Date.now() - new Date(state.startedAt).getTime()) / 1000)
            : 0
    );

    // Persist state to localStorage on every change
    useEffect(() => {
        saveState(state);
    }, [state]);

    // Tick the elapsed counter while running
    useEffect(() => {
        if (!state.startedAt) return;

        const calcElapsed = () =>
            Math.floor((Date.now() - new Date(state.startedAt!).getTime()) / 1000);

        const interval = setInterval(() => {
            setElapsedSeconds(calcElapsed());
        }, 1000);

        return () => clearInterval(interval);
    }, [state.startedAt]);

    const start = useCallback(() => {
        setState({
            startedAt: new Date().toISOString(),
            description: '',
            stoppedResult: null,
        });
    }, []);

    const setDescription = useCallback((d: string) => {
        setState((prev) => ({ ...prev, description: d }));
    }, []);

    const stop = useCallback(() => {
        setState((prev) => {
            if (!prev.startedAt) return prev;
            const ms = Date.now() - new Date(prev.startedAt).getTime();
            const hours = Math.round((ms / 3_600_000) * 100) / 100;
            const date = new Date(prev.startedAt).toISOString().slice(0, 10);
            return {
                startedAt: null,
                description: '',
                stoppedResult: {
                    hours,
                    description: prev.description,
                    date,
                },
            };
        });
        setElapsedSeconds(0);
    }, []);

    const discard = useCallback(() => {
        setState({ ...defaultState });
        setElapsedSeconds(0);
    }, []);

    const value = useMemo<TimerContextType>(() => ({
        isRunning: state.startedAt !== null,
        isStopped: state.stoppedResult !== null,
        elapsedSeconds,
        description: state.description,
        setDescription,
        start,
        stop,
        discard,
        stoppedResult: state.stoppedResult,
    }), [state, elapsedSeconds, setDescription, start, stop, discard]);

    return (
        <TimerContext.Provider value={value}>
            {children}
        </TimerContext.Provider>
    );
}

export function useTimer(): TimerContextType {
    const context = useContext(TimerContext);
    if (!context) {
        throw new Error('useTimer must be used within a TimerProvider');
    }
    return context;
}
