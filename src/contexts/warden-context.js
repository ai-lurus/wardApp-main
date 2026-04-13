// Warden context — holds panel open/closed state, the active conversation,
// the list of conversations loaded so far, and the current draft text.
//
// Pattern mirrors `auth-context.js` deliberately: plain `useReducer` with a
// HANDLERS map and an `handlers` lookup table. No Zustand (listed in root
// CLAUDE.md but not actually installed), no Redux, no React Query.
//
// All state transitions are immutable — handlers return a *new* state object
// every time. The reducer is a pure function; side effects (API calls,
// streaming) live in the components or hooks that dispatch into it.
//
// Streaming-specific note: `APPEND_MESSAGE` pushes a new message onto the
// active conversation, while `UPDATE_STREAMING_MESSAGE` mutates only the
// trailing message's `text` field — this is how the SSE reader in T027
// accumulates tokens without re-creating the array on every chunk.
import { createContext, useCallback, useContext, useMemo, useReducer } from 'react';
import PropTypes from 'prop-types';

const HANDLERS = {
  OPEN_PANEL: 'OPEN_PANEL',
  CLOSE_PANEL: 'CLOSE_PANEL',
  TOGGLE_PANEL: 'TOGGLE_PANEL',
  SET_DRAFT: 'SET_DRAFT',
  SET_ACTIVE_CONVERSATION: 'SET_ACTIVE_CONVERSATION',
  LOAD_CONVERSATIONS: 'LOAD_CONVERSATIONS',
  ADD_CONVERSATION: 'ADD_CONVERSATION',
  APPEND_MESSAGE: 'APPEND_MESSAGE',
  UPDATE_STREAMING_MESSAGE: 'UPDATE_STREAMING_MESSAGE',
  RESET: 'RESET'
};

const initialState = {
  panelOpen: false,
  activeConversationId: null,
  conversations: [],
  draftText: ''
};

const handlers = {
  [HANDLERS.OPEN_PANEL]: (state) => ({
    ...state,
    panelOpen: true
  }),
  [HANDLERS.CLOSE_PANEL]: (state) => ({
    ...state,
    panelOpen: false
  }),
  [HANDLERS.TOGGLE_PANEL]: (state) => ({
    ...state,
    panelOpen: !state.panelOpen
  }),
  [HANDLERS.SET_DRAFT]: (state, action) => ({
    ...state,
    draftText: action.payload ?? ''
  }),
  [HANDLERS.SET_ACTIVE_CONVERSATION]: (state, action) => ({
    ...state,
    activeConversationId: action.payload ?? null
  }),
  [HANDLERS.LOAD_CONVERSATIONS]: (state, action) => ({
    ...state,
    conversations: Array.isArray(action.payload) ? action.payload : []
  }),
  [HANDLERS.ADD_CONVERSATION]: (state, action) => {
    const conversation = action.payload;
    if (!conversation?.id) return state;
    // Avoid duplicates when the same conversation arrives twice (e.g. from
    // an optimistic create followed by the server echo).
    const exists = state.conversations.some((c) => c.id === conversation.id);
    const next = exists
      ? state.conversations.map((c) => (c.id === conversation.id ? { ...c, ...conversation } : c))
      : [conversation, ...state.conversations];
    return {
      ...state,
      conversations: next,
      activeConversationId: conversation.id
    };
  },
  [HANDLERS.APPEND_MESSAGE]: (state, action) => {
    const { conversationId, message } = action.payload ?? {};
    if (!conversationId || !message) return state;
    return {
      ...state,
      conversations: state.conversations.map((c) =>
        c.id === conversationId
          ? { ...c, messages: [...(c.messages ?? []), message] }
          : c
      )
    };
  },
  [HANDLERS.UPDATE_STREAMING_MESSAGE]: (state, action) => {
    const { conversationId, delta } = action.payload ?? {};
    if (!conversationId || typeof delta !== 'string') return state;
    return {
      ...state,
      conversations: state.conversations.map((c) => {
        if (c.id !== conversationId) return c;
        const messages = c.messages ?? [];
        if (messages.length === 0) return c;
        const lastIdx = messages.length - 1;
        const last = messages[lastIdx];
        const updated = { ...last, text: `${last.text ?? ''}${delta}` };
        return {
          ...c,
          messages: [...messages.slice(0, lastIdx), updated]
        };
      })
    };
  },
  [HANDLERS.RESET]: () => ({ ...initialState })
};

const reducer = (state, action) =>
  handlers[action.type] ? handlers[action.type](state, action) : state;

export const WardenContext = createContext({
  ...initialState,
  openPanel: () => {},
  closePanel: () => {},
  togglePanel: () => {},
  setDraft: () => {},
  setActiveConversation: () => {},
  loadConversations: () => {},
  addConversation: () => {},
  appendMessage: () => {},
  updateStreamingMessage: () => {},
  reset: () => {}
});

export const WardenProvider = (props) => {
  const { children } = props;
  const [state, dispatch] = useReducer(reducer, initialState);

  const openPanel = useCallback(() => dispatch({ type: HANDLERS.OPEN_PANEL }), []);
  const closePanel = useCallback(() => dispatch({ type: HANDLERS.CLOSE_PANEL }), []);
  const togglePanel = useCallback(() => dispatch({ type: HANDLERS.TOGGLE_PANEL }), []);
  const setDraft = useCallback(
    (text) => dispatch({ type: HANDLERS.SET_DRAFT, payload: text }),
    []
  );
  const setActiveConversation = useCallback(
    (conversationId) =>
      dispatch({ type: HANDLERS.SET_ACTIVE_CONVERSATION, payload: conversationId }),
    []
  );
  const loadConversations = useCallback(
    (list) => dispatch({ type: HANDLERS.LOAD_CONVERSATIONS, payload: list }),
    []
  );
  const addConversation = useCallback(
    (conversation) => dispatch({ type: HANDLERS.ADD_CONVERSATION, payload: conversation }),
    []
  );
  const appendMessage = useCallback(
    (conversationId, message) =>
      dispatch({ type: HANDLERS.APPEND_MESSAGE, payload: { conversationId, message } }),
    []
  );
  const updateStreamingMessage = useCallback(
    (conversationId, delta) =>
      dispatch({ type: HANDLERS.UPDATE_STREAMING_MESSAGE, payload: { conversationId, delta } }),
    []
  );
  const reset = useCallback(() => dispatch({ type: HANDLERS.RESET }), []);

  const value = useMemo(
    () => ({
      ...state,
      openPanel,
      closePanel,
      togglePanel,
      setDraft,
      setActiveConversation,
      loadConversations,
      addConversation,
      appendMessage,
      updateStreamingMessage,
      reset
    }),
    [
      state,
      openPanel,
      closePanel,
      togglePanel,
      setDraft,
      setActiveConversation,
      loadConversations,
      addConversation,
      appendMessage,
      updateStreamingMessage,
      reset
    ]
  );

  return <WardenContext.Provider value={value}>{children}</WardenContext.Provider>;
};

WardenProvider.propTypes = {
  children: PropTypes.node
};

export const WardenConsumer = WardenContext.Consumer;

export const useWardenContext = () => useContext(WardenContext);
