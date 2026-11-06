# Guida tecnica — dal terminale alla dashboard

## 1. Aprire il progetto

Copiate `04_starter_template` in una cartella del gruppo. Aprite quella cartella in VS Code e selezionate l'interprete Python del corso. Nel terminale posizionato accanto a `main.py` eseguite:

```powershell
python main.py
```

Lo starter non ha ancora un menu: eseguendolo legge `data/dati.json` e scrive `output/report.json`. Scrivere il menu è un lavoro del gruppo (in `main.py` c'è un commento TODO), insieme agli altri TODO. Per vedere un esempio finito avviate invece la demo in `03_esempi/python_data_reporter`.

## 2. Separare le responsabilità

| File | Responsabilità | Esempio |
|---|---|---|
| `main.py` | Menu, input e messaggi | Chiede una quantità e chiama una funzione |
| `logic.py` | Regole ed elaborazione | Riceve una lista e restituisce un riepilogo |
| `storage.py` | Lettura e scrittura | Carica JSON, salva un risultato CSV/JSON |
| `frontend/` | Visualizzazione | Legge il file scelto e mostra tabella/indicatori |

`from logic import elabora` rende disponibile la funzione; `elabora(dati)` la chiama. Il blocco `if __name__ == "__main__":` fa partire il programma quando il file viene eseguito direttamente. Importare le funzioni non deve aprire un menu né chiedere input.

## 3. Input e risultati

`input()` restituisce testo. Convertite nel tipo necessario e gestite i valori non validi prima di modificare dati. Distinguete errore di conversione e regola del progetto: `-2` è convertibile in intero, ma potrebbe non essere una quantità ammessa. Lasciate sempre una via di uscita dal menu.

Una funzione di calcolo usa parametri e restituisce dati con `return`; il chiamante decide come stamparli con `print()`. Preferite funzioni piccole, con un compito e nomi descrittivi. Non dipendete da variabili create in un notebook diverso.

## 4. Percorsi affidabili

In uno script `.py` usate la posizione del file per trovare cartelle del progetto:

```python
from pathlib import Path

BASE = Path(__file__).resolve().parent
percorso_dati = BASE / "data" / "dati.json"
percorso_report = BASE / "output" / "report.json"
```

`Path.cwd()` indica invece dove è stato aperto il terminale. `__file__` è disponibile nei moduli `.py`, non normalmente nelle celle del notebook. Verificate lo script anche avviandolo da una cartella diversa con il percorso del suo `main.py`.

## 5. Definire un contratto dei dati

Prima del codice, scrivete un record JSON di esempio e l'output atteso. Stabilite nomi dei campi, tipi, unità e casi ammessi. Non inventate valori mancanti per evitare un errore: chiedete una correzione o documentate lo scarto.

Leggete e scrivete testo con UTF-8. Per CSV usate `csv.reader`/`DictReader` e `writer`/`DictWriter`, `newline=""` e intestazioni esplicite. Per JSON usate `json.load`/`dump`. Intercettate file assente e formato errato con messaggi comprensibili; non azzerate un archivio valido se una lettura fallisce. Salvate gli output separatamente dagli input e riapriteli per verificarli.

## 6. Caricare un risultato nel browser senza server

Aprite `frontend/index.html` con doppio clic, poi scegliete esplicitamente il file esportato da Python. Il browser riceve soltanto il file selezionato. Questo frammento mostra il collegamento, non una dashboard completa:

```html
<label>Report JSON <input id="report-file" type="file" accept=".json"></label>
<pre id="risultato"></pre>
<script>
const scelta = document.querySelector('#report-file');
const risultato = document.querySelector('#risultato');
scelta.addEventListener('change', async () => {
  const file = scelta.files[0];
  if (!file) return;
  try {
    const testo = await file.text();
    if (!testo.trim()) throw new Error('File vuoto');
    const report = JSON.parse(testo.replace(/^\uFEFF/, ""));
    // TODO: verificare i campi del contratto del proprio progetto.
    risultato.textContent = JSON.stringify(report, null, 2);
  } catch (errore) {
    risultato.textContent = 'File non utilizzabile: ' + errore.message;
  }
});
</script>
```

Per il CSV riutilizzate e comprendete il parser della demo e il suo formato documentato: una semplice divisione con `split(',')` rompe i campi quotati che contengono virgole. I nomi dei campi della demo non sono uno standard universale: adattate il contratto alla vostra challenge.

Niente `fetch()` di file locali, server o librerie CDN è necessario. I dati vanno mostrati con `textContent`. JavaScript può filtrare e ordinare la presentazione; statistiche, punteggi e regole fondamentali restano in Python. Dopo una modifica in Python rigenerate il file e selezionatelo nuovamente nel frontend.

## 7. Verificare prima di presentare

Provate avvio/uscita, tre operazioni, dato valido, conversione errata, campo vuoto, elemento assente, dataset vuoto se ammesso e file mancante/malformato. Per ogni caso registrate atteso, osservato ed esito nel modello finale. Fate eseguire il README a un altro componente, senza suggerimenti. Se una funzione non è pronta dichiaratelo e mostrate il flusso effettivamente funzionante.
