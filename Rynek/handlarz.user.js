// ==UserScript==
// @name         Ekspresowy Handlarz - FINAL FIX
// @version      1.3.3
// @description  NAPRAWA: Wymień (Szukaj) vs Oferta (Wystaw) - Odwrócona Logika pól.
// @author       Gal Anonim
// @match        *://*.plemiona.pl/game.php?*screen=market*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    if (typeof game_data === 'undefined') return;
    const urlParams = new URLSearchParams(window.location.search);

    // --- TRYB 1: WYMIEŃ (Inni gracze oferują, ja szukam) ---
    // W tej zakładce: "Czego szukasz" (buy) jest po LEWEJ, "Co oferujesz" (sell) po PRAWEJ.
    if (window.location.href.includes('mode=other_offer') && urlParams.has('buy_res')) {
        const co_chce = urlParams.get('buy_res');  // Zielone z kalkulatora
        const co_mam = urlParams.get('sell_res');  // Czerwone z kalkulatora
        
        // Czego szukasz? (To co chcemy kupić)
        $(`input[name="res_buy"][value="${co_chce}"]`).prop('checked', true);
        // Co oferujesz? (To co chcemy oddać)
        $(`input[name="res_sell"][value="${co_mam}"]`).prop('checked', true);
        
        $('#trader_time_max_hours').val(2);
        
        // Klikamy SZUKAJ po krótkiej chwili
        setTimeout(() => { 
            const submitBtn = $('form[action*="action=search"] input[type="submit"]');
            if(submitBtn.length) submitBtn.click(); 
        }, 500);
    }

    // --- TRYB 2: OFERTA (Ja wystawiam, inni kupują) ---
    // W tej zakładce: "Oferuję" (sell) jest po LEWEJ, "Potrzebuję" (buy) po PRAWEJ.
    if (window.location.href.includes('mode=own_offer') && urlParams.has('offer_buy')) {
        const co_chce = urlParams.get('offer_buy');  // Kupuję (Dostanę)
        const co_mam = urlParams.get('offer_sell'); // Sprzedaję (Oddam)
        const needed = parseInt(urlParams.get('needed')) || 1000;
        const merchants = parseInt($('#market_merchant_available_count').text()) || 0;
        
        // Ilość ofert (paczki po 1000) - sprawdzamy spichlerz i wolnych kupców
        const count = Math.min(merchants, Math.ceil(needed / 1000));

        if (count > 0) {
            // Wartości stałe 1k:1k
            $('#res_sell_amount').val(1000);
            $('#res_buy_amount').val(1000);
            
            // ZAZNACZANIE (Logika: Oddaję co mam, Chcę co brak)
            // Oferuję (sell) -> s
            $(`#res_sell_${co_mam}`).prop('checked', true);
            // Potrzebuję (buy) -> b
            $(`#res_buy_${co_chce}`).prop('checked', true);
            
            $('input[name="multi"]').val(count);
            $('input[name="max_time"]').val(2);

            $('#submit_offer').css({
                "border": "4px solid green", 
                "background": "#c0dfb0",
                "padding": "10px",
                "font-weight": "bold"
            }).val("GOTOWE: WYSTAW " + count + " OFERT");
        }
    }
})();
