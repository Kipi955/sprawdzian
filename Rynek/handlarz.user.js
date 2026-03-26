// ==UserScript==
// @name         Ekspresowy Handlarz
// @version      1.3.0
// @description  DODATEK HANDEL do kalkulatora 
// @author       Gal Anonim
// @match        *://*.plemiona.pl/game.php?*screen=market*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=plemiona.pl
// @grant        none
// @downloadURL  
// @updateURL    
// ==/UserScript==

(function() {
    'use strict';

    // Inicjalizacja danych gry
    if (typeof game_data === 'undefined') return;
    const vId = game_data.village.id;

    // Pomocniczy czyścik liczb
    const cleanNum = (val) => {
        if (!val) return 0;
        let text = val.toString().replace(/<span class="grey">\.<\/span>/g, '');
        return parseInt(text.replace(/\D/g, '')) || 0;
    };

    // --- FUNKCJA 1: SKANOWANIE TWOICH WYSTAWIONYCH OFERT (DO PAMIĘCI) ---
    function scanOwnOffers() {
        if (window.location.href.includes('mode=own_offer') || window.location.href.includes('mode=all_own_offer')) {
            let onMarket = { w: 0, g: 0, i: 0 };

            // Przeszukiwanie tabeli ofert gracza
            $('.offer_container').each(function() {
                const row = $(this);
                const count = parseInt(row.find('td[id^="offer_count_"]').text()) || 1;
                
                // Druga komórka zawiera surowiec, który SPRZEDAJEMY
                const sellCell = row.find('td').eq(1); 
                let amountPerOffer = cleanNum(sellCell.text());
                let totalAmount = amountPerOffer * count;

                if (sellCell.find('.wood').length) onMarket.w += totalAmount;
                if (sellCell.find('.stone').length) onMarket.g += totalAmount;
                if (sellCell.find('.iron').length) onMarket.i += totalAmount;
            });

            // Zapis do localStorage, by główny skrypt Etykiety mógł to odczytać
            localStorage.setItem(`calc_on_market_${vId}`, JSON.stringify(onMarket));
            console.log("Etykiety: Zaktualizowano stan ofert na rynku:", onMarket);
        }
    }

    // --- FUNKCJA 2: SKANOWANIE NADCHODZĄCYCH DOSTAW (DLA TRYBU WEZWIJ) ---
    function scanMarketIncoming() {
        if (window.location.href.includes('mode=call')) {
            const resSumTable = $('#res_sum');
            if (resSumTable.length) {
                let inc = {
                    w: cleanNum($('#total_wood').html()),
                    g: cleanNum($('#total_stone').html()),
                    i: cleanNum($('#total_iron').html())
                };
                localStorage.setItem(`calc_inc_${vId}`, JSON.stringify(inc));
                console.log("Etykiety: Zaktualizowano nadchodzące dostawy:", inc);
            }
        }
    }

    // Uruchomienie skanowania przy każdym wejściu na stronę rynku
    scanOwnOffers();
    scanMarketIncoming();

    // --- LOGIKA AUTOMATYZACJI FORMULARZY ---
    const urlParams = new URLSearchParams(window.location.search);

    // TRYB: WYMIEŃ (Szukanie ofert innych graczy)
    if (window.location.href.includes('mode=other_offer') && urlParams.has('buy_res')) {
        const form = $('form[action*="action=search"]');
        if (form.length) {
            form.find(`input[name="res_sell"][value="${urlParams.get('buy_res')}"]`).prop('checked', true);
            form.find(`input[name="res_buy"][value="${urlParams.get('sell_res')}"]`).prop('checked', true);
            $('#trader_time_max_hours').val("2"); // Filtr czasu dostawy: 2h
            
            // Usunięcie parametrów z URL, by uniknąć pętli po przeładowaniu
            const newUrl = window.location.href.replace(/&buy_res=\w+|&sell_res=\w+/g, '');
            window.history.replaceState({}, document.title, newUrl);
            
            form.submit();
        }
    }

    // TRYB: OFERTA (Tworzenie własnych ofert 1:1)
    if (window.location.href.includes('mode=own_offer') && urlParams.has('offer_buy')) {
        const merchantText = $('#market_merchant_available_count').text();
        const availableTraders = parseInt(merchantText) || 0;

        if (availableTraders > 0) {
            // Wpisanie wartości
            $('#res_sell_amount').val(1000);
            $('#res_buy_amount').val(1000);
            
            // Zaznaczenie odpowiednich surowców
            $(`#res_sell_${urlParams.get('offer_sell')}`).prop('checked', true);
            $(`#res_buy_${urlParams.get('offer_buy')}`).prop('checked', true);
            
            // Ustawienie liczby ofert na max dostępnych kupców
            $('input[name="multi"]').val(availableTraders);
            $('input[name="max_time"]').val(2); // Max czas trwania: 2h

            // Wizualne potwierdzenie gotowości
            $('#submit_offer').css({
                "border": "4px solid #008000",
                "background": "#c0dfb0",
                "font-weight": "bold"
            }).val("KLIKNIJ: WYSTAW " + availableTraders + " OFERT");
        } else {
            $('#submit_offer').val("BRAK WOLNYCH KUPCÓW").prop('disabled', true);
        }
    }
})();
