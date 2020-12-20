// ==UserScript==
// @name         PokeWarsBot
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Simple script for automated pokemon catching. If the backpack is full, the bot sells all catched pokemons. Additionally replenishes HP of your pokemon and buys pokeballs when needed.
// @author       Piotrassin
// @match        https://gra.pokewars.pl/*
// @grant        GM_setValue
// @grant        GM_getValue
// @require http://code.jquery.com/jquery-2.1.0.min.js
// @run-at  document-end
// ==/UserScript==

$(function() {
    'use strict';
    window.addEventListener('load', function() {
		
        if (typeof(Storage) !== "undefined") {
            if (!sessionStorage.sellPokemonsIndicator) {
                sessionStorage.setItem('sellPokemonsIndicator', 0);
            }
        }
        choose();

        //sellAllPokemons();


    }, false);

    function choose() {
        var currentPage = window.location.href

        switch(currentPage) {
            case 'https://gra.pokewars.pl/start':
                goHunting();
                break;
            case 'https://gra.pokewars.pl/polowanie':
                hunt();
                break;
            case 'https://gra.pokewars.pl/handlarz/3':
                hunt();
                break;
        }
    }

    function goHunting(){
        location.href = "javascript:void(poluj_w_75.submit());";
        //location.href = "javascript:void(poluj_w_1.submit());"; //for testing, use location nr 1
    }

    function checkIfTired(){
        var alertText = "";
        try{
            alertText = document.getElementsByClassName("alert-box error")[0].innerText;
        }catch(error) {
            console.log("AP nominal");
        }
        var result = alertText.match(/Nie masz wystarczającej ilości Punktów Akcji/);
        refillAP(result);
    }

    async function refillAP(result){
        if(result) {
            var ret = document.getElementById('dr_oak_drink_count').innerText;
            if(ret > 0){
                location.href = "javascript:void(drinkOak());";
            }else {
                console.log("waiting 5 mins for AP points");
                await sleep(300000); //wait 5 minutes if no AP points are left
            }
        }
    }

    function checkIfReserveFull(){
        var reserve = document.getElementsByClassName("rezerwa-count")[0].innerText;
        if(reserve === 30){
            GM_setValue('counter', 1);
            sellAllPokemons();
        }
    }

    async function sellAllPokemons(){
        await sleep(1000);

        if(i === 1){
            location.href = "https://gra.pokewars.pl/hodowla"
            GM_setValue('counter', i + 1);
        }else if(i === 2){}
        await sleep(1000);
        location.href = "javascript:void(form_question('sellAll','Na pewno chcesz sprzedać wszystkie odblokowane pokemony z rezerwy?'););";
        await sleep(1000);
        document.getElementsByClassName("vex-dialog-button-primary vex-dialog-button vex-first")[0].submit();
        await sleep(1000);
    }

    function healAllPokemons(){
        location.href = "javascript:void(healAll());";
    }

    async function hunt(){
        var pokemonsToClick = document.getElementsByClassName("col w_1-4");
        var netballToClick = document.getElementsByName("pokeball_Netball");
        var levelballToClick = document.getElementsByName("pokeball_Levelball");
        var huntButtonsToClick = document.getElementsByClassName("col w_5-10");
        var actionPoints = document.getElementById("action_points_count");

        // write how many resources you have
        console.log("actionPoints " + actionPoints.textContent);
        console.log("pokemons " + pokemonsToClick.length);
        console.log("net " + netballToClick.length);
        console.log("level " + levelballToClick.length);
        console.log("huntButton " + huntButtonsToClick.length);

        checkIfTired();
        checkIfReserveFull();
        //healAllPokemons();

        //choose second pokemon for combat
        if(pokemonsToClick.length > 0) {
            console.log("Second pokemon chosen");
            await sleep(1000);
            document.getElementsByClassName("col w_1-4")[1].getElementsByTagName('form')[0].submit();
        }

        //if netball button exist, then click it
        else if(netballToClick.length > 0 && levelballToClick.length > 0){
            console.log("netball thrown");
            await sleep(1000);
            location.href = "javascript:void(pokeball_Netball.submit());";
        }

        //if not netball button is found then click levelball button
        else if(netballToClick.length < 1 && levelballToClick.length > 0){
            console.log("levelball thrown");
            await sleep(1000);
            location.href = "javascript:void(pokeball_Levelball.submit());";
        }

        // if none of the above, then click "continue" button
        else if(huntButtonsToClick.length > 1){
            console.log("continue")
            await sleep(1000);

            // don't exactly know why, but sometimes the first and sometimes the second one works
            try {
                document.getElementsByClassName("niceButton big_padding full_width prevent_multiclick").poluj.click();
            }catch(error) {
                document.getElementsByClassName("col w_5-10")[1].getElementsByTagName('form')[0].submit();
            }
        }
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
});