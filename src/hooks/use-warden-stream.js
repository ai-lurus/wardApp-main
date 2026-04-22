import { useCallback, useRef, useState } from 'react';
import { useWardenContext } from 'src/contexts/warden-context';
import { config } from 'src/config/env.config';

export function useWardenStream() {
  const { addConversation, appendMessage, updateStreamingMessage, appendCard } =
    useWardenContext();
  const abortRef = useRef(null);
  const statusRef = useRef('idle');
  const [status, setStatus] = useState('idle');

  const sendMessage = useCallback(
    async ({ text, conversationId, moduleHint }) => {
      if (statusRef.current === 'streaming') return;
      statusRef.current = 'streaming';
      setStatus('streaming');

      const token =
        typeof window !== 'undefined' ? window.sessionStorage.getItem('token') : null;
      const controller = new AbortController();
      abortRef.current = controller;

      if (conversationId) {
        appendMessage(conversationId, {
          id: `user-${Date.now()}`,
          role: 'user',
          text,
        });
      }

      let activeConvId = conversationId ?? null;

      try {
        const resp = await fetch(`${config.apiBaseUrl}/warden/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            conversationId: conversationId || null,
            text,
            moduleHint: moduleHint || null,
          }),
          signal: controller.signal,
        });

        if (!resp.ok) {
          throw new Error(`Warden request failed: ${resp.status}`);
        }

        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        const handleEvent = (eventType, dataStr) => {
          let data;
          try {
            data = JSON.parse(dataStr);
          } catch {
            return;
          }
          switch (eventType) {
            case 'conversation':
              activeConvId = data.id;
              addConversation({ id: data.id, messages: [], preview: text.slice(0, 60), createdAt: new Date().toISOString() });
              appendMessage(data.id, { id: `user-${Date.now()}`, role: 'user', text });
              break;
            case 'message_start':
              if (activeConvId) {
                appendMessage(activeConvId, {
                  id: data.messageId,
                  role: 'warden',
                  text: '',
                  status: 'streaming',
                  cards: [],
                });
              }
              break;
            case 'token':
              if (activeConvId && typeof data.token === 'string') {
                updateStreamingMessage(activeConvId, data.token);
              }
              break;
            case 'card':
              if (activeConvId && data.cardType && data.payload) {
                appendCard(activeConvId, { cardType: data.cardType, payload: data.payload });
              }
              break;
            case 'message_end':
              break;
            default:
              break;
          }
        };

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split('\n\n');
          buffer = parts.pop() ?? '';
          for (const part of parts) {
            let eventType = 'message';
            let dataStr = '';
            for (const line of part.split('\n')) {
              if (line.startsWith('event: ')) {
                eventType = line.slice(7).trim();
              } else if (line.startsWith('data: ')) {
                dataStr = line.slice(6);
              }
            }
            if (dataStr) handleEvent(eventType, dataStr);
          }
        }

        statusRef.current = 'idle';
        setStatus('idle');
      } catch (err) {
        if (err.name === 'AbortError') {
          statusRef.current = 'idle';
          setStatus('idle');
        } else {
          statusRef.current = 'error';
          setStatus('error');
        }
      } finally {
        abortRef.current = null;
      }
    },
    [addConversation, appendMessage, updateStreamingMessage, appendCard]
  );

  const cancel = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    statusRef.current = 'idle';
    setStatus('idle');
  }, []);

  return { sendMessage, cancel, status };
}
