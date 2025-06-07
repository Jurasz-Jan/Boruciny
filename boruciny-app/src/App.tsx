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
  Map
} from './types';

// Condition handlers
type EffectHandler = (state: GameState, param: string) => GameState;

const conditionHandlers: Record<string, (state: GameState, param: string, inputCode?: string) => boolean> = {
  hasFlag: (state, flagName) => {
    return state.flags.includes(flagName);
  },
  hasItem: (state, param) => {
    const parts = param.split('>=');
    const itemId = parts[0].trim();
    const requiredCount = parts.length > 1 ? parseInt(parts[1].trim()) : 1;
    const actualCount = state.inventory.filter(item => item === itemId).length;
    return actualCount >= requiredCount;
  },
  // Ten handler użyje hasła przekazanego jako currentInputCode
  inputCode: (state, expectedCode, currentInputCode) => {
    return currentInputCode === expectedCode.toUpperCase();
  },
};

const effectHandlers: Record<string, (state: GameState, param: string, data?: typeof gameData) => GameState> = {
  setFlag: (state, id) => ({
    ...state,
    flags: [...new Set([...state.flags, id])],
  }),
  addItem: (state, id) => ({
    ...state,
    inventory: [...state.inventory, id],
  }),
  revealToken: (state, id) => ({
    ...state,
    discoveredTokens: [...new Set([...state.discoveredTokens, id])],
  }),
  addMap: (state, param, data) => {
    if (!data) {
      console.error("Game data not provided to addMap effect handler.");
      return state;
    }
    const [mapId, xStr, yStr] = param.split(':');
    const x = parseInt(xStr);
    const y = parseInt(yStr);
    const newMap: ActiveMap = { id: mapId, x, y };

    if (state.activeMaps.some(m => m.id === newMap.id)) return state;

    const mapDefinition: Map | undefined = data.maps[mapId];

    if (!mapDefinition) {
      console.warn(`Próba dodania nieistniejącej mapy: ${mapId}`);
      return state;
    }

    const newVisibleTokens = mapDefinition.tokens.filter(
      (tokenId) => !mapDefinition.hiddenTokens || !mapDefinition.hiddenTokens.includes(tokenId)
    );

    return {
      ...state,
      activeMaps: [...state.activeMaps, newMap],
      discoveredTokens: [...new Set([...state.discoveredTokens, ...newVisibleTokens])],
    };
  },
  removeItem: (state, id) => ({
    ...state,
    inventory: state.inventory.filter(item => item !== id),
  }),
  removeToken: (state, tokenIdToRemove) => ({
    ...state,
    removedTokens: [...state.removedTokens, tokenIdToRemove],
    discoveredTokens: state.discoveredTokens.filter(id => id !== tokenIdToRemove),
  }),
};


function App() {
  const [gameState, setGameState] = useState<GameState>(() => {
    const savedState = localStorage.getItem('gameState');
    if (savedState) {
      return JSON.parse(savedState);
    } else {
      const initialDiscoveredTokens: TokenID[] = [];
      for (const activeMap of gameData.initialGameState.activeMaps) {
        const mapDefinition: Map | undefined = gameData.maps[activeMap.id];
        if (mapDefinition) {
          for (const tokenId of mapDefinition.tokens) {
            if (!mapDefinition.hiddenTokens || !mapDefinition.hiddenTokens.includes(tokenId)) {
              initialDiscoveredTokens.push(tokenId);
            }
          }
        }
      }
      return {
        ...gameData.initialGameState,
        discoveredTokens: [...new Set(initialDiscoveredTokens)],
      };
    }
  });

  const [currentCard, setCurrentCard] = useState<TextCard | ChoiceCard | null>(null);
  const [selectedToken, setSelectedToken] = useState<TokenID | null>(null);
  const [message, setMessage] = useState('Kliknij żeton na planszy');

  // --- UPROSZCZONE STANY DLA HASŁA ---
  const [inputCodeValue, setInputCodeValue] = useState('');
  // Usunięto: isPasswordRequired, currentPasswordCard
  // --- KONIEC UPROSZCZONYCH STANÓW ---

  useEffect(() => {
    localStorage.setItem('gameState', JSON.stringify(gameState));
  }, [gameState]);

  const checkCondition = useCallback((state: GameState, condition?: string, currentInputCode?: string): boolean => {
    if (!condition) return true;

    return condition.split('&&').every(expr => {
      const trimmed = expr.trim();
      let negate = false;
      let key = trimmed;

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

      // Jeśli handler to inputCode, zawsze przekazujemy bieżącą wartość z inputCodeValue state
      // W innym przypadku, przekazujemy tylko state i param.
      const result = handlerName === 'inputCode' ? handler(state, param, currentInputCode) : handler(state, param);
      return negate ? !result : result;
    });
  }, []);

  const applyEffect = useCallback(
    (state: GameState, effect?: string): GameState => {
      if (!effect) return state;

      const effectList = effect.split(';').map(e => e.trim()).filter(Boolean);

      return effectList.reduce((updatedState, effectStr) => {
        const [effectType, ...params] = effectStr.split(':');
        const param = params.join(':');
        const handler = effectHandlers[effectType];

        if (!handler) {
          console.error(`No effect handler for: ${effectType}`);
          return updatedState;
        }

        return handler(updatedState, param, gameData);
      }, state);
    },
    []
  );

  const getTriggeredEvent = useCallback(
    (state: GameState): CardID | null => {
      for (const eventId of gameData.events) {
        if (state.triggeredEvents.includes(eventId)) continue;

        const card = gameData.cards[eventId];
        if (!card) continue;

        // Tutaj nie przekazujemy inputCodeValue, bo to globalne wydarzenie i nie powinno zależeć od konkretnego inputu hasła.
        if (checkCondition(state, card.condition)) {
          return card.id;
        }
      }
      return null;
    },
    [checkCondition]
  );

  const handleCardAction = useCallback(
    (card: TextCard | ChoiceCard, choice?: Choice) => {
      let newState = gameState;

      if (choice) {
        // Jeśli jest wybór, sprawdzamy jego warunek.
        if (choice.condition && !checkCondition(newState, choice.condition)) {
          if (choice.onConditionFail) {
            const failCard = gameData.cards[choice.onConditionFail];
            if (failCard) {
              setCurrentCard(failCard);
              setMessage('');
              setSelectedToken(null);
            } else {
              console.warn(`Karta 'onConditionFail' dla wyboru z ID '${choice.onConditionFail}' nie została znaleziona.`);
              setMessage('Warunki dla tego wyboru nie zostały spełnione.');
              setCurrentCard(null);
              setSelectedToken(null);
            }
          } else {
            setMessage('Warunki dla tego wyboru nie zostały spełnione.');
            setCurrentCard(null);
            setSelectedToken(null);
          }
          return;
        }

        if (choice.effect) {
          newState = applyEffect(newState, choice.effect);
        }
      }

      // Sprawdź warunek karty. Tutaj przekazujemy inputCodeValue do checkCondition.
      // To handleCardAction jest wywoływane przez "OK" (dla zwykłych kart)
      // lub przez handlePasswordSubmit (dla kart z hasłem po poprawnym wpisaniu).
      // W przypadku hasła, warunek inputCode: będzie już spełniony.
      if (card.condition && !checkCondition(newState, card.condition, inputCodeValue)) {
        if (card.onConditionFail) {
          const failCard = gameData.cards[card.onConditionFail];
          if (failCard) {
            setCurrentCard(failCard);
            setMessage('');
            setSelectedToken(null);
          } else {
            console.warn(`Karta 'onConditionFail' z ID '${card.onConditionFail}' nie została znaleziona.`);
            setMessage('Warunki dla tej karty nie zostały spełnione.');
            setCurrentCard(null);
            setSelectedToken(null);
          }
        } else {
          setMessage('Warunki dla tej karty nie zostały spełnione.');
          setCurrentCard(null);
          setSelectedToken(null);
        }
        return; // Warunki nie spełnione, zatrzymaj dalsze przetwarzanie
      }

      if (card.effect) {
        newState = applyEffect(newState, card.effect);
      }

      if (card.removeToken !== false && selectedToken) {
        newState = {
          ...newState,
          removedTokens: [...newState.removedTokens, selectedToken],
          discoveredTokens: newState.discoveredTokens.filter(id => id !== selectedToken)
        };
      }

      const eventId = getTriggeredEvent(newState);
      if (eventId) {
        const eventCard = gameData.cards[eventId];
        if (eventCard) {
          newState = {
            ...newState,
            triggeredEvents: [...newState.triggeredEvents, eventId],
          };

          if (eventCard.effect) {
            newState = applyEffect(newState, eventCard.effect);
          }

          let mapName = "nieznany obszar";
          if (eventCard.effect) {
            const effectParts = eventCard.effect.split(';');
            const addMapEffect = effectParts.find(e => e.trim().startsWith('addMap:'));
            if (addMapEffect) {
              const mapId = addMapEffect.split(':')[1];
              mapName = gameData.maps[mapId]?.name || mapName;
            }
          }

          setGameState(newState);
          setCurrentCard(eventCard);
          setMessage(`Odkryto nowy obszar: ${mapName}`);
          setSelectedToken(null);
          return;
        }
      }

      const nextId = choice?.next || (card as TextCard).next;
      if (nextId && gameData.cards[nextId]) {
        setGameState(newState);
        setCurrentCard(gameData.cards[nextId]);
        setMessage('');
        setSelectedToken(null);
      } else {
        setGameState(newState);
        setMessage('Wybierz kolejny żeton');
        setCurrentCard(null);
        setSelectedToken(null);
      }
    },
    [gameState, selectedToken, applyEffect, checkCondition, getTriggeredEvent, inputCodeValue]
  );

  // --- UPROSZCZONA FUNKCJA handlePasswordSubmit ---
  const handlePasswordSubmit = useCallback(() => {
    // Sprawdzamy hasło TYLKO dla aktualnie wyświetlanej karty, jeśli ma warunek inputCode
    if (!currentCard || !currentCard.condition?.includes("inputCode:")) {
      setMessage('Błąd: Brak aktywnej karty z hasłem.');
      return;
    }

    // Sprawdzamy hasło, używając wartości z inputCodeValue
    if (checkCondition(gameState, currentCard.condition, inputCodeValue)) {
      // Hasło poprawne
      setMessage('Hasło poprawne!');
      setInputCodeValue(''); // Wyczyść pole hasła
      // Przetwórz kartę ponownie. Teraz warunek hasła będzie spełniony.
      handleCardAction(currentCard);
    } else {
      // Hasło niepoprawne
      setMessage('Błędne hasło! Spróbuj ponownie.');
      setInputCodeValue(''); // Wyczyść pole, aby spróbować ponownie

      if (currentCard.onConditionFail) {
        const failCard = gameData.cards[currentCard.onConditionFail];
        if (failCard) {
          setCurrentCard(failCard); // Przejdź do karty onConditionFail
          setMessage('');
          setSelectedToken(null);
        } else {
          console.warn(`Karta 'onConditionFail' z ID '${currentCard.onConditionFail}' nie została znaleziona.`);
          setMessage('Błędne hasło. Spróbuj ponownie.');
          // Jeśli onConditionFail nie istnieje, zostaw gracza na karcie z hasłem
          // lub opcjonalnie wróć do mapy: setCurrentCard(null); setSelectedToken(null);
        }
      } else {
        setMessage('Błędne hasło. Spróbuj ponownie.');
        // Jeśli nie ma onConditionFail, pozostajemy na tej samej karcie,
        // lub opcjonalnie wracamy do mapy: setCurrentCard(null); setSelectedToken(null);
      }
    }
  }, [checkCondition, gameState, inputCodeValue, currentCard, handleCardAction]);
  // --- KONIEC UPROSZCZONEJ FUNKCJI ---

  // Handle token click
  const handleTokenClick = (tokenId: TokenID, mapId: MapID) => {
    // Sprawdź, czy aktualnie wyświetlana karta wymaga hasła
    const isPasswordCardActive = currentCard?.condition?.includes("inputCode:");

    if (isPasswordCardActive) { // Jeśli już wprowadzamy hasło, zignoruj kliknięcia na tokeny
      setMessage('Wprowadź hasło, aby kontynuować.');
      return;
    }

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

    setSelectedToken(tokenId); // Zapamiętaj wybrany token

    // Sprawdź, czy karta wymaga hasła poprzez jej warunek
    const requiresPassword = card.condition?.includes("inputCode:");
    if (requiresPassword) {
      setCurrentCard(card); // Wyświetl kartę z prośbą o hasło
      setInputCodeValue(''); // Wyczyść pole hasła
      setMessage('Wprowadź hasło:');
      return; // Zatrzymaj dalsze przetwarzanie, czekamy na hasło
    }

    // Standardowa logika, jeśli hasło nie jest wymagane lub zostało już sprawdzone
    if (!checkCondition(gameState, card.condition)) {
      if (card.onConditionFail) {
        const failCard = gameData.cards[card.onConditionFail];
        if (failCard) {
          setCurrentCard(failCard);
          setMessage('');
        } else {
          console.warn(`Karta 'onConditionFail' z ID '${card.onConditionFail}' nie została znaleziona.`);
          setMessage('Nie spełniasz warunków, by odsłonić tę kartę.');
          setCurrentCard(null);
        }
      } else {
        setMessage('Nie spełniasz warunków, by odsłonić tę kartę.');
        setCurrentCard(null);
      }
      setSelectedToken(null);
      return;
    }

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

    // Sprawdź, czy aktualna karta ma warunek inputCode:
    const requiresPassword = currentCard.condition?.includes("inputCode:");

    return (
      <div className="card-overlay">
        <div className="card">
          <h3>{currentCard.title || 'Wydarzenie'}</h3>

          {currentCard.type === 'text' && (
            <>
              <p>{currentCard.content}</p>
              {/* Wyświetl pole do wprowadzania hasła, jeśli karta TEGO wymaga */}
              {requiresPassword && (
                <div className="code-input-container">
                  <input
                    type="text"
                    value={inputCodeValue}
                    onChange={(e) => setInputCodeValue(e.target.value.toUpperCase())}
                    maxLength={6}
                    pattern="[A-ZĄĆĘŁŃÓŚŹŻ]{6}"
                    placeholder="Wprowadź hasło (6 liter)"
                    autoFocus
                  />
                  <button onClick={handlePasswordSubmit}>OK</button>
                </div>
              )}
              {/* Pokaż przycisk OK tylko jeśli NIE jesteśmy w trybie wprowadzania hasła */}
              {!requiresPassword && (
                <button onClick={() => handleCardAction(currentCard)}>OK</button>
              )}
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

  const renderMap = (map: ActiveMap) => {
    const mapDef = gameData.maps[map.id];
    if (!mapDef) return null;

    // Czy aktualnie wyświetlona karta wymaga hasła?
    const isPasswordCardActive = currentCard?.condition?.includes("inputCode:");

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
                disabled={isRemoved || !isDiscovered || isPasswordCardActive} // Wyłącz, jeśli karta z hasłem jest aktywna
              >
                {isDiscovered ? `Żeton ${tokenId}` : 'Ukryty'}
              </button>
            );
          })}
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
          const initialDiscoveredTokens: TokenID[] = [];
          for (const activeMap of gameData.initialGameState.activeMaps) {
            const mapDef: Map | undefined = gameData.maps[activeMap.id];
            if (mapDef) {
              for (const tokenId of mapDef.tokens) {
                if (!mapDef.hiddenTokens || !mapDef.hiddenTokens.includes(tokenId)) {
                  initialDiscoveredTokens.push(tokenId);
                }
              }
            }
          }
          setGameState({
            ...gameData.initialGameState,
            discoveredTokens: [...new Set(initialDiscoveredTokens)],
          });
          setMessage('Gra zresetowana');
          setCurrentCard(null);
          setSelectedToken(null);
          // Resetuj stany związane z hasłem
          setInputCodeValue('');
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