var MAX_LK = 10; // twardy limit LK na fejk

var setArmyFaking = {
    start: function(){
        this.setsetArmyFakingDane();

        if(document.getElementById("unit_input_spear") == undefined){
            this.info(3);
            return;
        }

        var minLudnosci = Math.floor(window.game_data.village.points * setArmyFakingDane.fakeLimit / 100);
        var ludnosc = 0;

        for(var i=0; i<10; i++){
            var ile = 0;
            if(setArmyFakingDane.jednostki[i].czyAtakowacTaJednostka){
                ile = document.getElementById("units_entry_all_"+setArmyFakingDane.jednostki[i].name)
                    .innerHTML.slice(1,-1)*1;
            }
            setArmyFakingDane.jednostki[i].ile = ile;
            ludnosc += ile * setArmyFakingDane.jednostki[i].ludnosc;
        }

        if(ludnosc < minLudnosci){
            this.info(0);
            return;
        }

        // --- TARAN ---
        if(setArmyFakingDane.jednostki[8].ile <= 0){
            this.info(1);
            return;
        }

        setArmyFakingDane.jednostki[8].send = 1;
        setArmyFakingDane.jednostki[8].ile--;
        minLudnosci -= 5;

        // --- ZWIAD ---
        if(setArmyFakingDane.czyMusiBycZwiad && setArmyFakingDane.jednostki[4].ile <= 0){
            this.info(2);
            return;
        }

        var maxZwiad = Math.floor(minLudnosci / 2);
        var zwiad = Math.min(setArmyFakingDane.jednostki[4].ile, maxZwiad);

        setArmyFakingDane.jednostki[4].send = zwiad;
        setArmyFakingDane.jednostki[4].ile -= zwiad;
        minLudnosci -= zwiad * 2;

        // --- LK (LIMITOWANE) ---
        if(minLudnosci > 0 && setArmyFakingDane.jednostki[5].ile > 0){
            var lkMaxByPop = Math.floor(minLudnosci / 4);
            var lk = Math.min(MAX_LK, lkMaxByPop, setArmyFakingDane.jednostki[5].ile);

            setArmyFakingDane.jednostki[5].send = lk;
            setArmyFakingDane.jednostki[5].ile -= lk;
            minLudnosci -= lk * 4;
        }

        // --- TANIA PIECHOTA NA DOBICIE ---
        var hierarchia = [2,0,1,3]; // topór → pik → miecz → łuk

        for(var i=0; i<hierarchia.length && minLudnosci>0; i++){
            var j = hierarchia[i];
            var ile = Math.min(
                setArmyFakingDane.jednostki[j].ile,
                minLudnosci / setArmyFakingDane.jednostki[j].ludnosc
            );

            ile = Math.floor(ile);
            if(ile <= 0) continue;

            setArmyFakingDane.jednostki[j].send += ile;
            setArmyFakingDane.jednostki[j].ile -= ile;
            minLudnosci -= ile * setArmyFakingDane.jednostki[j].ludnosc;
        }

        // --- WPISANIE DO FORMULARZA ---
        for(var i=0; i<10; i++){
            var el = document.getElementById("unit_input_"+setArmyFakingDane.jednostki[i].name);
            if(el) el.value = setArmyFakingDane.jednostki[i].send;
        }

        this.info(11);
    },

    setsetArmyFakingDane: function(){
        var n = ["spear","sword","axe","archer","spy","light","marcher","heavy","ram","catapult"];
        var l = [1,1,1,1,2,4,5,6,5,8];

        for(var i=0;i<10;i++){
            setArmyFakingDane.jednostki[i].name = n[i];
            setArmyFakingDane.jednostki[i].ludnosc = l[i];
            setArmyFakingDane.jednostki[i].send = 0;
        }
    },

    info: function(i){
        var k = "";
        switch(i){
            case 0: k="Za mało wojska"; break;
            case 1: k="Brak taranów"; break;
            case 2: k="Brak zwiadu"; break;
            case 3: k="Nie ta strona"; break;
            case 11: k="Fejk ustawiony"; break;
        }
        if(i<10) UI.ErrorMessage(k);
        else UI.SuccessMessage(k);
    }
};

setArmyFaking.start();
