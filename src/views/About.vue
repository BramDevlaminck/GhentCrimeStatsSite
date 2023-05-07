<template>
    <div class="container-lg">
        <h1>About Page</h1>
        <div>
            <p>
                Deze website is gemaakt met een combinatie van Vue.js (add link), D3 v7 (add link) en bootstrap v5, samen met wat custom css om alles samen te brengen.
                Zoals vermeld op de introductie pagina komt het grootste deel van de data van het Open Data Portaal van Gent.
                De belangrijkste datasets kunnen op de volgende link terug gevonden worden: <a href="https://data.stad.gent/explore/?disjunctive.keyword&disjunctive.theme&sort=modified&q=politie">data.stad.gent</a>.
                Maar voor sommige andere stukken is ook gebruik gemaakt van deze (<a href="https://data.stad.gent/explore/dataset/fietsenstallingen-gent/table/">fietsenstallingen-gent</a>) dataset die aangeeft waar de fietsparkingen zijn en hoeveel plaatsen er zijn.
                Dit bevatte echter niet de informatie van in welke wijk deze parking lag. Dit hebben we aan de hand van een Python script zelf toegevoegd.
                Dit script kan op deze GitHub repository terug gevonden worden: <a href=">https://github.com/BramDevlaminck/DatavisualisationPreprocessing">https://github.com/BramDevlaminck/DatavisualisationPreprocessing</a>
                Verder bevat deze repository ook nog een json-file die voor elke hoge school en universiteitscampus die we konden vinden in gent de locatie + wijk bevat.
                Opnieuw hebben we dit zelf samengesteld. Het idee was om deze data te linken met bv het aantal fietsdiefstallen maar dit bleek niet praktisch aangezien het grootste deel van de campussen toch in de wijk "Binnenstad" ligt.
                Indien de opdeling van wijken preciezer was ging dit wel een interessante piste zijn om verder te onderzoeken. Aangezien we deze data nu toch al hebben stellen we ze toch nog beschikbaar op deze manier.
                Hopelijk kan iemand anders hier iets nuttigs mee doen.
            </p>
            <h3>Problemen</h3>
            <p>
                Relatief vroeg in het proces van het onderzoeken van de datasets hebben we ondervonden dat er voor 1 categorie aan feiten data ontbrak/foutieve entries waren.
                Elke maand was het totaal aantal van "verkeersongevallen met lichamelijke verwondingen" op 0. Er was dus effectief een entry in de data, maar het aantal stond op 0.
                Bovendien waren er voor 2021 en 2023 dubbele entries in de datasets.
                Tijdens de ontwikkeling van het project zijn daarom meerdere conversaties gestart met het open data portaal om zo stap voor stap alle problemen die we in de dataset tegen kwamen op te lossen.
                Uiteindelijk is voor 2020-2023 de verkeersongevallen met lichamelijke verwondingen opgelost, voor 2019-2019 is dit jammergenoeg niet gelukt.
                Bovendien zijn nu ook alle dubbele entries uit de dataset.
                Op deze manier zijn we er toch nog in geslaagd deze data correct weer te geven in deze visualisaties, terwijl deze tot voor kort onvolledig was.
            </p>
            <p>
                Auteurs: Isis Garayalde Vandendriessche, Thomas Van Mullem & Bram Devlaminck.
            </p>
        </div>
    </div>
</template>