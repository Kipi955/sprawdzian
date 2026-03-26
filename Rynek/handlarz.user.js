// ==UserScript==
// @name         Ekspresowy Handlarz - RESET ALL FIX
// @version      1.3.5
// @description  FIX: Odblokowuje kółka wyboru surowców używając opcji "wszystkie".
// @author       Gal Anonim
// @match        *://*.plemiona.pl/game.php?*screen=market*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    if (typeof game_data === 'undefined') return;
    const urlParams = new URLSearchParams(window.location.search);

    // --- TRYB 1: WYMIEŃ (Szukanie) ---
    if (window.location.href.includes('mode=other_offer') && urlParams.has('buy_res')) {
        const b = urlParams.get('buy_res'); 
        const s = urlParams.get('sell_res');
        
        // 1. Reset - wybierz "wszystkie" (all) w obu kolumnach
        $(`input[name="res_buy"][value="all"]`).prop('checked', true);
        $(`input[name="res_sell"][value="all"]`).prop('checked', true);
        
        // 2. Ustaw właściwe po krótkiej chwili (100ms wystarczy)
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

        // 1. Reset - w tej zakładce ID to np. res_buy_all
        $('#res_buy_all').prop('checked', true);
        $('#res_sell_all').prop('checked', true);

        setTimeout(() => {
            // 2. Wartości i zaznaczenie właściwych
            $('#res_sell_amount').val(1000);
            $('#res_buy_amount').val(1000);
            $('input[name="multi"]').val(count);
            $('input[name="max_time"]').val(2);

            $(`#res_sell_${s}`).prop('checked', true);
            $(`#res_buy_${b}`).prop('checked', true);

            $('#submit_offer').css({"border":"4px solid green", "background":"#c0dfb0"}).val("GOTOWE: WYSTAW " + count + " OFERT");
        }, 100);
    }
})();
