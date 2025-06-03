# 🎩 Tworzenie danych do gry 

Ten plik opisuje, jak tworzyć dane do gry. Gra działa w oparciu o plik `data.ts` lub `testData.ts` zawierający strukturę `GameData`.

- Tymczasowo,dla demonstracji plik używa  `testData.ts` `zamiast data.ts`
- Żeby to zmienić, należy  w `App.tsx` w linijce 3 zmienić `import gameData from './testData';` na  `import gameData from './Data';`


---

## 📦 Struktura pliku `GameData`

```ts
interface GameData {
  tokens: Record<TokenID, Token>;
  maps: Record<MapID, Map>;
  cards: Record<CardID, TextCard | ChoiceCard>;
  events: CardID[];             // karty typu event (reagujące na stan gry)
  initialGameState: GameState;  // stan początkowy gry
}
```

---

## 🧹 Jak działa gra?

Gracz:
1. Wchodzi na mapę i klika **żetony**.
2. Żetony prowadza do **kart (text lub choice)**.
3. Karty mogą:
   - ustawiać **flagi** (`setFlag`)
   - dodawać **itemy** (`addItem`)
   - usuwać itemy (`removeItem`)
   - odsłaniać nowe **mapy** (`addMap`)
4. Karty mogą mieć **warunki** (`condition`) – np. pokażą się tylko jeśli masz dany item.

---

## 🗼 Tworzenie map

```ts
const maps = {
  "1": {
    id: "1",
    name: "Dom Ciotki",
    tokens: ["1", "2", "3"]
  },
  "2": {
    id: "2",
    name: "Sekretny Ogród",
    tokens: ["30"]
  }
};
```

- Każda mapa ma unikalne ID.
- Mapa zawiera **listę żetonów**, które się na niej znajdują.

---

## 🎯 Tworzenie żetonów

```ts
const tokens = {
  "1": { id: "1", cardId: "1", mapId: "1" },
  "30": { id: "30", cardId: "30", mapId: "2" }
};
```

- `id`: unikalny numer żetonu
- `cardId`: karta, która pojawi się po kliknięciu żetonu
- `mapId`: na której mapie się znajduje

---

## 🃏 Tworzenie kart

Karty mogą być dwóch typów:

### `TextCard`
Pokazuje tekst i ewentualnie wykonuje efekt.

```ts
"1": {
  id: "1",
  type: "text",
  content: "Znalazłeś list.",
  effect: "addItem:list"
}
```

### `ChoiceCard`
Zawiera pytanie i możliwe wybory.

```ts
"30": {
  id: "30",
  type: "choice",
  question: "Otworzyć skrzynię?",
  choices: [
    { id: "30A", text: "Tak", next: "30A" },
    { id: "30B", text: "Nie", next: "30B" }
  ]
}
```

---

## 🎮 Efekty (`effect`)

Efekty wykonują **zmiany w stanie gry**.

Można użyć wielu efektów, rozdzielając je `;`:

```
effect: "setFlag:flagaA; addItem:klucz; addMap:2:1:0"
```

**Dostępne efekty:**

| Efekt              | Opis                                       |
|--------------------|--------------------------------------------|
| `setFlag:flaga`    | Ustaw flagę                                |
| `addItem:item`     | Dodaj item do ekwipunku                    |
| `removeItem:item`  | Usuń item z ekwipunku                      |
| `addMap:id:x:y`    | Odsłoń mapę o ID w danym miejscu (grid)   |

---

- z racji występowania drobnego buga `addMap:id:x:y;` należy dodawać na końcu stringa `effect` i należy zakonczyć go średnikiem- jeżeli w danym efekcie dodajemy mapę, efekt powiniene się kończyć w postaci `...;addMap:id:x:y;`

---

## ✅ Warunki (`condition`)

Warunki mówią, **czy karta się pokazuje**.

Przykład:

```ts
condition: "hasFlag:flagaTestowa & hasItem:klucz"
```

**Dostępne warunki:**

| Warunek               | Opis                                                |
|------------------------|-----------------------------------------------------|
| `hasFlag:nazwa`        | Sprawdza, czy gracz ma daną flagę                  |
| `hasItem:nazwa`        | Sprawdza, czy gracz ma item                        |
| `tokenRemoved:id`      | Czy żeton został już użyty                         |
| `not hasFlag:x`        | Warunek negatywny                                  |

---

## ⚡ Zdarzenia (`eventy`)

Są to specjalne karty, które uruchamiają się **automatycznie**, gdy spełniony jest warunek (np. dwa tokeny usunięte).

```ts
"eventTest": {
  id: "eventTest",
  type: "text",
  content: "Nowa mapa została odblokowana.",
  condition: "tokenRemoved:1 & tokenRemoved:2",
  effect: "addMap:3:0:1"
}
```

Dodajesz je do listy `events`.

---

## 🚀 Stan początkowy (`initialGameState`)

```ts
const initialGameState: GameState = {
  activeMaps: [{ id: "1", x: 0, y: 0 }],
  removedTokens: [],
  discoveredTokens: ["1", "2", "3"],
  flags: [],
  inventory: [],
  triggeredEvents: []
};
```

- `activeMaps`: które mapy są odsłonięte i gdzie (x, y)
- `discoveredTokens`: które żetony są widoczne
- `flags`: ustawione flagi
- `inventory`: posiadane itemy

---

## 🛠️ Tips 

- **Żeton bez wpisu w `tokens` nie działa.**
- **Każda karta musi mieć unikalny `id`.**
- **Nie zapomnij dodać `removeToken: true`, jeśli żeton ma zniknąć po użyciu.**
- Używaj `choice` kart, by dawać graczowi wybory.
- Korzystaj z `events`, by tworzyć reakcje globalne (np. odblokowanie nowej mapy).
- Przykładowe dane można znaleźć w pliku `testData.ts`

---

## 📄 Przykład pełnej karty z warunkiem i efektem:

```ts
"3": {
  id: "3",
  type: "text",
  content: "Znaleziono wejście do piwnicy.",
  condition: "hasItem:kluczPiwnica",
  effect: "addMap:5:2:0; removeItem:kluczPiwnica",
  removeToken: true
}
```


## Notka
Obecnie kliknięte karty wyświetlają różne wiadomości. W założeniu te wiadomości powinny być na fizycznych kartach, a wiadomość w aplikacji powinna po prostu brzmieć "Dobiesz kartę 3A", "Otrzymujesz klucz" itd.
