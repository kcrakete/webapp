/**
 * Kegel API Modul
 * Speichert den Endpunkt zur Google Apps Script WebApp und lädt/berechnet die Daten.
 */

const KEGEL_API_URL = "https://script.google.com/macros/s/AKfycbznHfmvDZz0lpsY2kNlS23E8hcY4O6KEmwclu85Oz4zanJIGRprgi8AZSX6TIaWhrbt/exec";

async function fetchKegelData() {
    try {
        const response = await fetch(KEGEL_API_URL);
        if (!response.ok) {
            throw new Error(`Fehler beim Abrufen der Daten: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Kegel API Fehler:", error);
        throw error;
    }
}

async function getKegelStats() {
    const data = await fetchKegelData();
    const { players, rows } = data;

    const statsMap = {};
    players.forEach(player => {
        statsMap[player] = {
            name: player,
            totalKallen: 0,
            totalParticipations: 0,
            avgKallen: 0,
            totalKings: 0,
            history: [] // Für individuelle Spielerstatistiken
        };
    });

    rows.forEach(row => {
        row.values.forEach((value, index) => {
            const playerName = players[index];
            if (value !== null && value !== undefined && !isNaN(value)) {
                statsMap[playerName].totalKallen += value;
                statsMap[playerName].totalParticipations += 1;
                statsMap[playerName].history.push({ date: row.date, kallen: value });
            }
        });

        if (row.king) {
            const kingName = row.king.trim();
            if (statsMap[kingName]) {
                statsMap[kingName].totalKings += 1;
            }
        }
    });

    const statsArray = Object.values(statsMap).map(player => {
        const avg = player.totalParticipations > 0 
            ? (player.totalKallen / player.totalParticipations) 
            : 0;
        
        return {
            ...player,
            avgKallen: Math.round(avg * 10) / 10
        };
    });

    // Absteigend nach Gesamtkallen sortieren
    return statsArray.sort((a, b) => b.totalKallen - a.totalKallen);
}
