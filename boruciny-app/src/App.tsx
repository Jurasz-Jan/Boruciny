// App.tsx
import React, { useState, useCallback } from 'react';
import gameData from './data';
import {
  GameState,
  TokenID,
  CardID,
  MapID,
  TextCard,
  ChoiceCard,
  Choice,
  ActiveMap,
} from './types';

// --- Handlery warunków ---
const conditionHandlers = {
  tokenRemoved: (state: GameState, id: string) => state.removedTokens.includes(id),
  hasItem: (state: GameState, id: string) => state.inventory.includes(id),
  hasFlag: (state: GameState, id: string) => state.flags.includes(id),
};

// --- Handlery efektów ---
const effectHandlers = {
  setFlag: (state: GameState, id: string): GameState => ({
    ...state,
    flags: [...new Set([...state.flags, id])],
  }),
  addItem: (state: GameState, id: string): GameState => ({
    ...state,
    inventory: [...new Set([...state.inventory, id])],
  }),
  addMap: (state: GameState, param: string): GameState => {
    const [mapId, x, y] = param.split(':');
    const newMap: ActiveMap = { id: mapId, x: parseInt(x), y: parseInt(y) };
    if (state.activeMaps.some((m) => m.id === newMap.id)) return state;
    return {
      ...state,
      activeMaps: [...state.activeMaps, newMap],
    };
  },
};

// --- Komponent główny ---
function App() {
  const [gameState, setGameState] = useState<GameState>(gameData.initialGameState);
  const [currentCard, setCurrentCard] = useState<TextCard | ChoiceCard | null>(null);
  const [selectedToken, setSelectedToken] = useState<TokenID | null>(null);
  const [message, setMessage] = useState('Kliknij żeton na planszy');

  const checkCondition = useCallback(
    (condition?: string): boolean => {
      if (!condition) return true;
      return condition.split('&').every((expr) => {
        const [rawKey, ...params] = expr.trim().split(':');
        const key = rawKey.startsWith('not ') ? rawKey.slice(4) : rawKey;
        const negate = rawKey.startsWith('not ');
        const value = params.join(':');
        const result = (conditionHandlers as any)[key]?.(gameState, value);
        return negate ? !result : result;
      });
    },
    [gameState]
  );

  const applyEffect = useCallback(
    (effect?: string): GameState => {
      if (!effect) return gameState;
      const [type, ...rest] = effect.split(':');
      const param = rest.join(':');
      const fn = (effectHandlers as any)[type];
      return fn ? fn(gameState, param) : gameState;
    },
    [gameState]
  );

  const handleCardAction = (card: TextCard | ChoiceCard, choice?: Choice) => {
    if (!checkCondition(card.condition)) {
      setMessage('Warunki nie zostały spełnione');
      setCurrentCard(null);
      setSelectedToken(null);
      return;
    }

    let newState = gameState;
    if (choice?.effect) newState = applyEffect(choice.effect);
    if ('effect' in card && card.effect) newState = applyEffect(card.effect);

    if (card.removeToken !== false && selectedToken) {
      newState = {
        ...newState,
        removedTokens: [...newState.removedTokens, selectedToken],
      };
    }

    setGameState(newState);

    const nextId = choice?.next || (card as TextCard).next;
    if (nextId && gameData.cards[nextId]) {
      setCurrentCard(gameData.cards[nextId]);
    } else {
      setMessage('Wybierz kolejny żeton');
      setCurrentCard(null);
      setSelectedToken(null);
    }
  };

  const handleTokenClick = (tokenId: TokenID, mapId: MapID) => {
    if (gameState.removedTokens.includes(tokenId)) {
      setMessage('Ten żeton już został użyty');
      return;
    }

    const token = gameData.tokens[tokenId];
    if (!token || token.mapId !== mapId) return;

    const card = gameData.cards[token.cardId];
    if (!card) return;

    setSelectedToken(tokenId);
    setCurrentCard(card);

    if (card.type === 'choice') {
      setMessage('Wybierz opcję');
    } else {
      handleCardAction(card);
    }
  };

  const renderCard = () => {
    if (!currentCard) return null;

    return (
      <div className="card-overlay">
        <div className="card">
          <h3>{currentCard.title || 'Wydarzenie'}</h3>
          {currentCard.type === 'text' && (
            <>
              <p>{currentCard.content}</p>
              <button onClick={() => handleCardAction(currentCard)}>OK</button>
            </>
          )}
          {currentCard.type === 'choice' && (
            <>
              <p>{currentCard.question}</p>
              {currentCard.choices.map((choice) => (
                <button key={choice.id} onClick={() => handleCardAction(currentCard, choice)}>
                  {choice.text}
                </button>
              ))}
            </>
          )}
        </div>
      </div>
    );
  };

  const renderMap = (map: ActiveMap) => {
    const mapDef = gameData.maps[map.id];
    return (
      <div
        key={map.id}
        className="map"
        style={{
          gridColumn: map.x + 1,
          gridRow: map.y + 1,
          border: '1px solid #ccc',
          padding: '1rem',
        }}
      >
        <h4>{mapDef.name}</h4>
        <div className="tokens">
          {mapDef.tokens.map((tokenId) => (
            <button
              key={tokenId}
              className={`token ${gameState.removedTokens.includes(tokenId) ? 'used' : ''}`}
              onClick={() => handleTokenClick(tokenId, map.id)}
              disabled={gameState.removedTokens.includes(tokenId)}
            >
              Żeton {tokenId}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const gridSize = gameState.activeMaps.reduce(
    (acc, map) => ({
      cols: Math.max(acc.cols, map.x + 1),
      rows: Math.max(acc.rows, map.y + 1),
    }),
    { cols: 1, rows: 1 }
  );

  return (
    <div className="App">
      <h1>Gra planszowa</h1>
      <p>Status: {message}</p>
      <p>Przedmioty: {gameState.inventory.join(', ') || 'brak'}</p>
      <p>Flagi: {gameState.flags.join(', ') || 'brak'}</p>

      <div
        className="board"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${gridSize.cols}, 1fr)`,
          gridTemplateRows: `repeat(${gridSize.rows}, 1fr)`,
          gap: '1rem',
          margin: '2rem 0',
        }}
      >
        {gameState.activeMaps.map(renderMap)}
      </div>

      {renderCard()}
    </div>
  );
}

export default App;
