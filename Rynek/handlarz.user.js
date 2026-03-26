// ==UserScript==
// @name         Ekspresowy Handlarz - FIX LOGIKI
// @version      1.3.2
// @description  DODATEK HANDEL - Poprawione kierunki: Szukanie (Inaczej) vs Tworzenie (Inaczej)
// @author       Gal Anonim
// @match        *://*.plemiona.pl/game.php?*screen=market*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    if (typeof game_data === 'undefined') return;
    const urlParams = new URLSearchParams(window.location.search);

    // --- TRYB: WYMIEŃ (Szukanie ofert innych graczy) ---
    // W tej tabeli w grze jest: 1. POTRZEBUJĘ (Buy), 2. OFERUJĘ (Sell)
    if (window.location.href.includes('mode=other_offer') && urlParams.has('buy_res')) {
        const b = urlParams.get('buy_res');  // To co chcemy DOSTAĆ (zielone z kalkulatora)
        const s = urlParams.get('sell_res'); // To co chcemy ODDAĆ (czerwone z kalkulatora)
        
        // Zaznaczamy w wyszukiwarce:
        // "Czego szukasz?" (res_buy) -> to nasz brak (b)
        // "Co oferujesz?" (res_sell) -> to nasz nadmiar (s)
        $(`input[name="res_buy"][value="${b}"]`).prop('checked', true);
        $(`input[name="res_sell"][value="${s}"]`).prop('checked', true);
        
        $('#trader_time_max_hours').val(2);
        
        // Automatyczne szukanie
        setTimeout(() => { $('form[action*="action=search"]').submit(); }, 400);
    }

    // --- TRYB: OFERTA (Tworzenie własnych ofert) ---
    // W tej tabeli w grze jest: 1. OFERUJĘ (Sell), 2. POTRZEBUJĘ (Buy)
    if (window.location.href.includes('mode=own_offer') && urlParams.has('offer_buy')) {
        const b = urlParams.get('offer_buy');  // Kupuję (Dostanę)
        const s = urlParams.get('offer_sell'); // Sprzedaję (Oddam)
        const needed = parseInt(urlParams.get('needed')) || 1000;
        const merchants = parseInt($('#market_merchant_available_count').text()) || 0;
        
        // Limitujemy ilość ofert do realnej potrzeby (paczki po 1000)
        const count = Math.min(merchants, Math.ceil(needed / 1000));

        if (count > 0) {
            // Wpisujemy kwoty 1000:1000
            $('#res_sell_amount').val(1000);
            $('#res_buy_amount').val(1000);
            
            // Zaznaczamy surowce:
            // "Oferuję" (res_sell) -> nasz nadmiar (s)
            // "Potrzebuję" (res_buy) -> nasz brak (b)
            $(`#res_sell_${s}`).prop('checked', true);
            $(`#res_buy_${b}`).prop('checked', true);
            
            $('input[name="multi"]').val(count);
            $('input[name="max_time"]').val(2);

            $('#submit_offer').css({
                "border": "4px solid green", 
                "background": "#c0dfb0",
                "height": "40px"
            }).val("WYSTAW " + count + " OFERT");
        }
    }
})();
