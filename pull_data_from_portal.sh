#!/bin/bash

# main datasets
years=(2018 2019 2020 2021 2022 2023)
path="public/Datasets"
for year in ${years[@]}; do
wget -O "${path}/criminaliteitscijfers-per-wijk-per-maand-gent-${year}.geojson" "https://data.stad.gent/api/explore/v2.1/catalog/datasets/criminaliteitscijfers-per-wijk-per-maand-gent-${year}/exports/geojson"
done

# residents per quarter dataset
wget -O "${path}/bevolkingsaantal-per-wijk-per-jaar-gent.geojson" "https://data.stad.gent/api/explore/v2.1/catalog/datasets/bevolkingsaantal-per-wijk-per-jaar-gent/exports/geojson"

# bike dataset
wget -O "${path}/bike_parkings_per_quarter.json" "https://raw.githubusercontent.com/BramDevlaminck/DatavisualisationPreprocessing/master/out/bike_parkings_per_quarter.json"