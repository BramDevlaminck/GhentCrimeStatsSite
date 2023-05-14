<template>
    <div class="wrapper">
        <h1>Introductie</h1>
        <h5>Wat?</h5>
        <p>
            Als project voor het vak <b>Datavisualisatie</b> aan UGent (gegeven door prof. dr. Bart Mesuere) is het de bedoeling om een dataset toegankelijker/interpreteerbaarder te maken aan de hand van visualisaties.
            Het proces om dit te doen bestaat ruw omschreven uit volgende stappen
            </p>
        <ul>
            <li>Zoek een interessante dataset</li>
            <li>Verken de dataset</li>
            <li>Maak de nodige visualisaties om de dataset toegankelijk te maken</li>
            <li>Vertel aan de hand van de visualisaties wat te zien valt</li>
        </ul>
        <h5>Zoektocht naar een dataset</h5>
        <p>
            Onze bedoeling was om te werken met data die geen ver-van-mijn-bedshow is voor de meeste mensen.
            Aangezien stad <b>Gent</b> redelijk wat data publiek beschikbaar stelt, vonden we dit een goeie plaats om een interessant onderwerp te zoeken.
            Deze datasets gaan over een grote variëteit aan onderwerpen.
            Zo zijn er datasets die eerder een culturele waarde (UiT in Gent) hebben, andere dan weer praktisch (Ivago).
            Uiteindelijk viel 1 categorie van datasets ons op.
            Dit waren datasets ter beschikking gesteld door de <b>politie</b>. Deze bevatten een overzicht per maand van de geregistreerde feiten per wijk.
        </p>
        <h5>Wat bestaat al?</h5>
        <p>
            De site van het dataportaal maakt de bestaande datasets beschikbaar in vele formaten:
        </p>
        <ul>
            <li>Interactief aan de hand van tabellen</li>
            <li>Via een API</li>
            <li>Als aparte datasets in verschillende formaten (CSV, Excel, JSON, GEOJSON, Shapefile, KML)</li>
            <li>Als kaart</li>
            <li>Via een interactieve en aanpasbare visualisatie</li>
        </ul>
        <h5>Huidige tekortkomingen</h5>
        <p>
            Deze laatste 2 zijn erg interessant om de data <b>toegankelijk</b> te maken naar het brede publiek.
            Ons viel echter al snel op dat deze opties best ingewikkeld zijn om mee te werken en niet in 1 oog opzicht de data kunnen voorstellen.
            Bovendien is het niet mogelijk om meerdere datasets samen te visualiseren.
            Dit is net iets wat ons heel erg interessant leek omdat dit de mogelijkheid geeft de <b>evolutie doorheen de tijd</b> te bekijken.
        </p>
        <h5>Onderzoek</h5>
        <p>
            Enkele vragen die direct bij ons opkwamen toen we de dataset aan het verkennen waren (en die we hopen te beantwoorden) zijn:
        </p>
        <ul>
            <li>Hoeveel fietsdiefstallen zijn er effectief en in welke regio's is dit vooral?</li>
            <li>Welke wijken hebben een verhoogd aantal geregistreerde feiten vergeleken met de rest van Gent?</li>
            <li>Wat is de invloed van corona en de Gentse feesten op het aantal feiten?</li>
        </ul>

        <p>
            Onze effectieve analyses zijn terug te vinden op het statistieken-tab van deze site.
            Wat meer informatie over ons en alle gebruikte datasets is terug te vinden op het info-tab.
        </p>
    </div>
</template>

<style scoped>
.wrapper {
    margin: 1rem auto auto;
    padding-bottom: 4rem;
    width: 75%;
}
</style>