// ==UserScript==
// @name         Ekspresowy Handlarz - UNBLOCK FIX
// @version      1.3.4
// @description  FIX: Odblokowuje kółka wyboru surowców przed zaznaczeniem.
// @author       Gal Anonim
// @match        *://*.plemiona.pl/game.php?*screen=market*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    if (typeof game_data === 'undefined') return;
    const urlParams = new URLSearchParams(window.location.search);

    // Funkcja odblokowująca: przesuwa oba zaznaczenia na Żelazo, żeby zwolnić Drewno/Glinę
    function unblockRadios(nameBuy, nameSell) {
        $(`input[name="${nameBuy}"][value="iron"]`).prop('checked', true);
        $(`input[name="${nameSell}"][value="iron"]`).prop('checked', true);
    }

    // --- TRYB 1: WYMIEŃ (Szukanie) ---
    if (window.location.href.includes('mode=other_offer') && urlParams.has('buy_res')) {
        const b = urlParams.get('buy_res'); 
        const s = urlParams.get('sell_res');
        
        // 1. Odblokuj (ustaw oba na żelazo)
        unblockRadios("res_buy", "res_sell");
        
        // 2. Ustaw właściwe po krótkiej chwili
        setTimeout(() => {
            $(`input[name="res_buy"][value="${b}"]`).prop('checked', true);
            $(`input[name="res_sell"][value="${s}"]`).prop('checked', true);
            $('#trader_time_max_hours').val(2);
            
            setTimeout(() => { 
                const btn = $('form[action*="action=search"] input[type="submit"]');
                if(btn.length) btn.click();
            }, 300);
        }, 100);
    }

    // --- TRYB 2: OFERTA (Wystawianie) ---
    if (window.location.href.includes('mode=own_offer') && urlParams.has('offer_buy')) {
        const b = urlParams.get('offer_buy');
        const s = urlParams.get('offer_sell');
        const needed = parseInt(urlParams.get('needed')) || 1000;
        const merchants = parseInt($('#market_merchant_available_count').text()) || 0;
        const count = Math.min(merchants, Math.ceil(needed / 1000));

        // 1. Odblokuj (W tej zakładce ID to res_buy_... i res_sell_...)
        // Przesuwamy na żelazo, żeby zwolnić inne surowce
        $('#res_buy_iron').prop('checked', true);
        $('#res_sell_iron').prop('checked', true);

        setTimeout(() => {
            // 2. Ustaw kwoty i multi
            $('#res_sell_amount').val(1000);
            $('#res_buy_amount').val(1000);
            $('input[name="multi"]').val(count);
            $('input[name="max_time"]').val(2);

            // 3. Zaznacz właściwe
            $(`#res_sell_${s}`).prop('checked', true);
            $(`#res_buy_${b}`).prop('checked', true);

            $('#submit_offer').css({"border":"4px solid green", "background":"#c0dfb0"}).val("GOTOWE: WYSTAW " + count + " OFERT");
        }, 100);
    }
})();
