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

const conditionHandlers: Record<string, (state: GameState, param: string) => boolean> = {
  // Obsługa warunku 'hasFlag:nazwaFlagi'
  hasFlag: (state, flagName) => {
    return state.flags.includes(flagName);
  },

  // Obsługa warunku 'hasItem:nazwaItemu' lub 'hasItem:nazwaItemu>=liczba'
  hasItem: (state, param) => {
    const parts = param.split('>=');
    const itemId = parts[0].trim();
    const requiredCount = parts.length > 1 ? parseInt(parts[1].trim()) : 1; // Domyślnie 1

    const actualCount = state.inventory.filter(item => item === itemId).length;
    return actualCount >= requiredCount;
  },

  // Możesz dodać inne handlery warunków, np.
  // hasStat: (state, param) => { /* logika dla statystyk */ return true; },
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
  addToken: (state, id) => ({
    ...state,
    discoveredTokens: [...new Set([...state.discoveredTokens, id])], // Dodaje token do odkrytych
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
  removeItem: (state, id) => ({
    ...state,
    inventory: state.inventory.filter(item => item !== id),
  }),
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
  
    // Rozdziel warunki za pomocą '&&'
    return condition.split('&&').every(expr => {
      const trimmed = expr.trim();
      let negate = false;
      let key = trimmed;
  
      // Sprawdzanie negacji '!' na początku lub 'not '
      if (trimmed.startsWith('!')) {
        negate = true;
        key = trimmed.slice(1).trim();
      } else if (trimmed.startsWith('not ')) {
        negate = true;
        key = trimmed.slice(4).trim();
      }
  
      const [handlerName, param] = key.split(':');
      const handler = conditionHandlers[handlerName];
  
      if (!handler) {
        console.error(`Brak handlera warunku dla: ${handlerName}. Warunek: ${condition}`);
        return false;
      }
  
      const result = handler(state, param);
      return negate ? !result : result;
    });
  }, []); // Zależność conditionHandlers, jeśli nie jest to globalny obiekt
  

  const applyEffect = useCallback(
    (state: GameState, effect?: string): GameState => {
      if (!effect) return state;
  
      // Obsługa wielu efektów oddzielonych średnikiem
      const effectList = effect.split(';').map(e => e.trim()).filter(Boolean);
  
      return effectList.reduce((updatedState, effectStr) => {
        const [effectType, ...params] = effectStr.split(':');
        const param = params.join(':');
        const handler = effectHandlers[effectType];
  
        if (!handler) {
          console.error(`No effect handler for: ${effectType}`);
          return updatedState;
        }
  
        return handler(updatedState, param);
      }, state);
    },
    []
  );
  

  // In getTriggeredEvent
    const getTriggeredEvent = useCallback(
        (state: GameState): CardID | null => {
          for (const eventId of gameData.events) { // <--- eventId is a string, correctly iterates through string IDs
            if (state.triggeredEvents.includes(eventId)) continue;
            
            const card = gameData.cards[eventId]; // <--- Correctly uses eventId as a string key
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
      if (choice && choice.condition && !checkCondition(newState, choice.condition)) {
        // Jeśli warunek wyboru niespełniony i ma zdefiniowane onConditionFail
        if (choice.onConditionFail) {
            const failCard = gameData.cards[choice.onConditionFail];
            if (failCard) {
                setGameState(newState); // Zastosuj efekty, jeśli jakieś były przed warunkiem wyboru
                setCurrentCard(failCard);
                setMessage(''); // Wyczyść wiadomość
                setSelectedToken(null);
                return; // Zakończ funkcję, nie przechodź do 'next'
            } else {
                console.warn(`Karta 'onConditionFail' dla wyboru z ID '${choice.onConditionFail}' nie została znaleziona.`);
            }
        }
        // Domyślne zachowanie, jeśli onConditionFail nie jest zdefiniowane dla wyboru
        setMessage('Warunki dla tego wyboru nie zostały spełnione.');
        // Pozostań na obecnej karcie lub wróć do mapy, w zależności od preferencji
        setCurrentCard(null); // Opcjonalnie: wróć do mapy
        setSelectedToken(null);
        return; // Zakończ funkcję
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
      // In handleCardAction
  const eventId = getTriggeredEvent(newState);
  if (eventId) {
    const eventCard = gameData.cards[eventId];
    if (eventCard) {
      newState = {
        ...newState,
        triggeredEvents: [...newState.triggeredEvents, eventId],
      };
      
      // FIXED: Safe map name extraction (You already have a fix here, but let's re-examine the logic)
      let mapName = "nieznany obszar";
      if (eventCard.effect) {
        const effectParts = eventCard.effect.split(':');
        if (effectParts.length >= 2) {
          const mapId = effectParts[1]; // <--- mapId is a string, which is correct
          mapName = gameData.maps[mapId]?.name || mapName; // <--- Correctly uses mapId as a string key
        }
      }
      
      setGameState(newState);
      setCurrentCard(eventCard); // <--- Sets the current card to the event card
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

    if (!checkCondition(gameState, card.condition)) {
      // Jeśli warunek niespełniony i karta ma zdefiniowane onConditionFail
      if (card.onConditionFail) {
          const failCard = gameData.cards[card.onConditionFail];
          if (failCard) {
              setCurrentCard(failCard);
              setMessage(''); // Wyczyść wiadomość, nowa karta to załatwi
          } else {
              console.warn(`Karta 'onConditionFail' z ID '${card.onConditionFail}' nie została znaleziona.`);
              setMessage('Nie spełniasz warunków, by odsłonić tę kartę.');
              setCurrentCard(null); // Wróć do mapy, jeśli karta przekierowania jest błędna
          }
      } else {
          // Domyślne zachowanie, jeśli onConditionFail nie jest zdefiniowane
          setMessage('Nie spełniasz warunków, by odsłonić tę kartę.');
          setCurrentCard(null); // Wróć do mapy
      }
      setSelectedToken(null); // Upewnij się, że nie ma wybranego żetonu
      return; // Zakończ funkcję
  }

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