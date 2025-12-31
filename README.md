# Google Ads Holiday Pauser 🎄

Google Ads Script pro automatické pozastavení kampaní během českých státních svátků.

## Proč tento skript?

### Víkendy vs. Svátky

| Situace | Řešení |
|---------|--------|
| **Víkendy** | Použij nativní **Ad Schedule** (Časový rozvrh) v Google Ads. Nastav Po-Pá a máš hotovo. |
| **Svátky** | Ad Schedule neumí "1. ledna" nebo pohyblivé Velikonoce → **použij tento skript**. |

### Kdy skript použít?

✅ **Vhodné pro:**
- B2B služby (konzultace, firemní software)
- Služby vázané na pracovní dobu
- Účty, kde máš data o nízké konverzi o svátcích

❌ **Spíš nepoužívat pro:**
- E-shopy (lidi nakupují i o svátcích)
- Lokální služby (masáže, fitness) - lidi mají volno a hledají
- Brand kampaně (konkurence možná pauzuje = levnější CPC)

## Funkce

- ✅ Automatické pozastavení všech typů kampaní (Search, Display, PMax, Shopping, Video)
- ✅ Automatická reaktivace po skončení svátku
- ✅ Labelování pauznutých kampaní (bezpečné pro vícedenní svátky)
- ✅ Email notifikace při změnách
- ✅ Podpora pohyblivých svátků (Velikonoce)

## České státní svátky

### Fixní svátky
| Datum | Svátek |
|-------|--------|
| 1. 1. | Nový rok |
| 1. 5. | Svátek práce |
| 8. 5. | Den vítězství |
| 5. 7. | Cyril a Metoděj |
| 6. 7. | Mistr Jan Hus |
| 28. 9. | Den české státnosti |
| 28. 10. | Vznik Československa |
| 17. 11. | Den boje za svobodu a demokracii |
| 24. 12. | Štědrý den |
| 25. 12. | 1. svátek vánoční |
| 26. 12. | 2. svátek vánoční |

### Pohyblivé svátky
| Svátek | Výpočet |
|--------|---------|
| Velký pátek | Velikonoční neděle - 2 dny |
| Velikonoční pondělí | Velikonoční neděle + 1 den |

Velikonoční neděle se počítá Gaussovým algoritmem - není potřeba ručně aktualizovat.

## Instalace

1. Otevři Google Ads účet
2. Jdi do **Tools & Settings → Bulk Actions → Scripts**
3. Klikni na **+** a vytvoř nový skript
4. Vlož kód ze souboru `holiday-pauser.js`
5. Uprav konstantu `EMAIL_RECIPIENT` na svůj email
6. Ulož a autorizuj skript

## Konfigurace
```javascript
const LABEL_NAME = 'Holiday_Paused';     // Název labelu pro označení
const LABEL_COLOR = '#FF6B6B';           // Barva labelu (červená)
const EMAIL_RECIPIENT = 'vas@email.cz';  // Email pro notifikace
```

### Úprava svátků

Pro přidání/odebrání svátků uprav pole `FIXED_HOLIDAYS`:
```javascript
const FIXED_HOLIDAYS = [
  '01-01', // Nový rok
  '05-01', // Svátek práce
  // ... přidej nebo odeber dle potřeby
];
```

## Nastavení spouštění

1. V editoru skriptu klikni na **Schedule**
2. Nastav **Daily** (denně)
3. Vyber čas **5:00 - 6:00** (před začátkem dne)

### Doporučené nastavení

| Frekvence | Čas | Poznámka |
|-----------|-----|----------|
| Denně | 05:00 | Pauzne před začátkem dne, reaktivuje po svátku |

## Jak to funguje
```
┌─────────────────────────────────────────────────────────┐
│                    Skript běží                          │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
                 ┌─────────────────┐
                 │  Je dnes svátek? │
                 └─────────────────┘
                    │           │
                   ANO          NE
                    │           │
                    ▼           ▼
          ┌──────────────┐  ┌──────────────────────┐
          │ Pauzni ENABLED│  │ Najdi kampaně s      │
          │ kampaně       │  │ labelem Holiday_Paused│
          │ + přidej label│  │ + reaktivuj je       │
          └──────────────┘  └──────────────────────┘
                    │           │
                    ▼           ▼
              ┌─────────────────────┐
              │   Pošli email       │
              │   (pokud změna)     │
              └─────────────────────┘
```

## Bezpečnostní prvky

1. **Label systém** - Skript reaktivuje pouze kampaně, které sám pauzl
2. **Vícedenní svátky** - Label brání dvojímu pauznutí (např. Vánoce 24.-26.12.)
3. **Ruční pauzy zachovány** - Kampaně pauznuté ručně zůstanou pauznuté

## Email notifikace

Email přijde pouze když se něco změní. Ukázka:
```
Subject: [Google Ads] ⏸️ Svátek 25.12.2025 - Kampaně pozastaveny

Účet: Název účtu
Datum: 25.12.2025 05:00
Akce: pozastaveno

Kampaně (3):
- [Search/Display] Brand kampan
- [PMax] Performance Max - hlavni
- [Shopping] Dárkové poukazy

---
Holiday Campaign Pauser Script
```

## Časté dotazy

### Mohu vyloučit některé kampaně?

Ano, přidej podmínku do selektoru:
```javascript
AdsApp.campaigns()
  .withCondition('campaign.status = ENABLED')
  .withCondition('campaign.name DOES_NOT_CONTAIN "Brand"') // Vyloučí brand kampaně
  .get()
```

### Co když skript selže?

Kampaně zůstanou v posledním stavu. Label `Holiday_Paused` ti pomůže identifikovat, které kampaně byly skriptem pauznuty.

### Funguje to pro MCC účty?

Tento skript je pro jednotlivé účty. Pro MCC verzi je potřeba použít `MccApp` a iterovat přes účty.

## Changelog

### v1.0.0
- Initial release
- Podpora všech typů kampaní (Search, Display, PMax, Shopping, Video)
- České státní svátky včetně pohyblivých Velikonoc
- Email notifikace
- Label systém pro bezpečnou reaktivaci

## Licence

MIT License - volně k použití a úpravám.

## Autor

Vytvořeno pro automatizaci Google Ads účtů v České republice.
