import './App.css';
import React, { useState, useCallback, useEffect } from 'react';
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

// Condition handlers
type ConditionHandler = (state: GameState, id: string) => boolean;
type EffectHandler = (state: GameState, param: string) => GameState;

const conditionHandlers: Record<string, ConditionHandler> = {
  tokenRemoved: (state, id) => state.removedTokens.includes(id),
  hasItem: (state, id) => state.inventory.includes(id),
  hasFlag: (state, id) => state.flags.includes(id),
};

const effectHandlers: Record<string, EffectHandler> = {
  setFlag: (state, id) => ({
    ...state,
    flags: [...new Set([...state.flags, id])],
  }),
  addItem: (state, id) => ({
    ...state,
    inventory: [...new Set([...state.inventory, id])],
  }),
  addMap: (state, param) => {
    const [mapId, xStr, yStr] = param.split(':');
    const x = parseInt(xStr);
    const y = parseInt(yStr);
    const newMap: ActiveMap = { id: mapId, x, y };

    if (state.activeMaps.some(m => m.id === newMap.id)) return state;

    const newTokens = gameData.maps[mapId]?.tokens ?? [];
    const discoveredTokens = [
      ...state.discoveredTokens,
      ...newTokens.filter(id => !state.discoveredTokens.includes(id)),
    ];

    return {
      ...state,
      activeMaps: [...state.activeMaps, newMap],
      discoveredTokens,
    };
  },
};


function App() {
  const [gameState, setGameState] = useState<GameState>(() => {
    const savedState = localStorage.getItem('gameState');
    return savedState ? JSON.parse(savedState) : gameData.initialGameState;
  });
  
  const [currentCard, setCurrentCard] = useState<TextCard | ChoiceCard | null>(null);
  const [selectedToken, setSelectedToken] = useState<TokenID | null>(null);
  const [message, setMessage] = useState('Kliknij żeton na planszy');

  // Save game state to localStorage
  useEffect(() => {
    localStorage.setItem('gameState', JSON.stringify(gameState));
  }, [gameState]);

  // Check conditions
  const checkCondition = useCallback((state: GameState, condition?: string): boolean => {
    if (!condition) return true;
  
    return condition.split('&').every(expr => {
      const trimmed = expr.trim();
      const negate = trimmed.startsWith('not ');
      const key = negate ? trimmed.slice(4) : trimmed;
      const [handlerName, param] = key.split(':');
      const handler = conditionHandlers[handlerName];
  
      if (!handler) {
        console.error(`No condition handler for: ${handlerName}`);
        return false;
      }
  
      const result = handler(state, param);
      return negate ? !result : result;
    });
  }, []);
  

  // Apply effects
  const applyEffect = useCallback(
    (state: GameState, effect?: string): GameState => {
      if (!effect) return state;
      
      const [effectType, ...params] = effect.split(':');
      const param = params.join(':');
      const handler = (effectHandlers as any)[effectType];
      
      if (!handler) {
        console.error(`No effect handler for: ${effectType}`);
        return state;
      }
      
      return handler(state, param);
    },
    []
  );

  // Get triggered event
  const getTriggeredEvent = useCallback(
    (state: GameState): CardID | null => {
      for (const eventId of gameData.events) {
        if (state.triggeredEvents.includes(eventId)) continue;
        
        const card = gameData.cards[eventId];
        if (!card) continue;
        
        if (checkCondition(state, card.condition)) {
          return card.id;
        }
      }
      return null;
    },
    [checkCondition]
  );

  // Handle card actions
  const handleCardAction = useCallback(
    (card: TextCard | ChoiceCard, choice?: Choice) => {
      let newState = gameState;
      
      // Apply choice effect
      if (choice?.effect) {
        newState = applyEffect(newState, choice.effect);
      }
      
      // Check card condition
      if (!checkCondition(newState, card.condition)) {
        setMessage('Warunki nie zostały spełnione');
        setCurrentCard(null);
        setSelectedToken(null);
        return;
      }
      
      // Apply card effect
      if (card.effect) {
        newState = applyEffect(newState, card.effect);
      }
      
      // Remove token if needed
      if (card.removeToken !== false && selectedToken) {
        newState = {
          ...newState,
          removedTokens: [...newState.removedTokens, selectedToken],
        };
      }
      
      // Check for triggered events
      const eventId = getTriggeredEvent(newState);
      if (eventId) {
        const eventCard = gameData.cards[eventId];
        if (eventCard) {
          newState = {
            ...newState,
            triggeredEvents: [...newState.triggeredEvents, eventId],
          };
          
          // FIXED: Safe map name extraction
          let mapName = "nieznany obszar";
          if (eventCard.effect) {
            const effectParts = eventCard.effect.split(':');
            if (effectParts.length >= 2) {
              const mapId = effectParts[1];
              mapName = gameData.maps[mapId]?.name || mapName;
            }
          }
          
          setGameState(newState);
          setCurrentCard(eventCard);
          setMessage(`Odkryto nowy obszar: ${mapName}`);
          return;
        }
      }
      
      // Move to next card
      const nextId = choice?.next || (card as TextCard).next;
      if (nextId && gameData.cards[nextId]) {
        setGameState(newState);
        setCurrentCard(gameData.cards[nextId]);
      } else {
        setGameState(newState);
        setMessage('Wybierz kolejny żeton');
        setCurrentCard(null);
        setSelectedToken(null);
      }
    },
    [gameState, selectedToken, applyEffect, checkCondition, getTriggeredEvent]
  );

  // Handle token click
  const handleTokenClick = (tokenId: TokenID, mapId: MapID) => {
    if (gameState.removedTokens.includes(tokenId)) {
      setMessage('Ten żeton już został użyty');
      return;
    }
  
    if (!gameState.discoveredTokens.includes(tokenId)) {
      setMessage('Ten żeton nie został jeszcze odkryty');
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
      setMessage('Kliknij OK, aby kontynuować');
    }
  };
  

  // Render card component
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
              {currentCard.choices.map(choice => (
                <button 
                  key={choice.id} 
                  onClick={() => handleCardAction(currentCard, choice)}
                >
                  {choice.text}
                </button>
              ))}
            </>
          )}
          
          
        </div>
      </div>
    );
  };

  // Render map component
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
          position: 'relative'
        }}
      >
        <div className="coordinates">
          ({map.x}, {map.y})
        </div>
        <h4>{mapDef.name}</h4>
        <div className="tokens">
          {mapDef.tokens.map(tokenId => {
            const isRemoved = gameState.removedTokens.includes(tokenId);
            const isDiscovered = gameState.discoveredTokens.includes(tokenId);
            
            return (
              <button
                key={tokenId}
                className={`token ${isRemoved ? 'used' : ''} ${!isDiscovered ? 'hidden' : ''}`}
                onClick={() => handleTokenClick(tokenId, map.id)}
                disabled={isRemoved || !isDiscovered}
              >
                {isDiscovered ? `Żeton ${tokenId}` : 'Ukryty'}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // Calculate grid size
  const gridSize = gameState.activeMaps.reduce(
    (acc, map) => ({
      cols: Math.max(acc.cols, map.x + 1),
      rows: Math.max(acc.rows, map.y + 1),
    }),
    { cols: 1, rows: 1 }
  );

  // Group inventory by type
  const inventoryGroups = gameState.inventory.reduce((acc, item) => {
    acc[item] = (acc[item] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="App">
      <h1>Boruciny</h1>
      
      <div className="controls">
        <button onClick={() => {
          localStorage.removeItem('gameState');
          setGameState(gameData.initialGameState);
          setMessage('Gra zresetowana');
        }}>
          Resetuj grę
        </button>
      </div>
      
      <p>Status: {message}</p>
      
      <div className="game-state">
        <h3>Ekwipunek:</h3>
        <ul>
            {Object.entries(inventoryGroups).length > 0 ? (
      Object.entries(inventoryGroups).map(([item, count]) => (
        <li key={item}>{item} × {count}</li>
      ))
    ) : (
      <li>Brak przedmiotów</li>
)}

        </ul>
        
        <h3>Flagi:</h3>
        <ul>
          {gameState.flags.map(flag => (
            <li key={flag}>{flag}</li>
          ))}
          {gameState.flags.length === 0 && <li>Brak flag</li>}
        </ul>
      </div>

      <div
        className="board"
        style={{
          gridTemplateColumns: `repeat(${gridSize.cols}, 1fr)`,
          gridTemplateRows: `repeat(${gridSize.rows}, 1fr)`
        }}
      >
        {gameState.activeMaps.map(renderMap)}
      </div>

      {renderCard()}
    </div>
  );
}

export default App;