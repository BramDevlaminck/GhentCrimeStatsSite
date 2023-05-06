#!/bin/bash
years=(2018 2019 2020 2021 2022 2023)

for year in ${years[@]}; do
wget -O "Datasets/criminaliteitscijfers-per-wijk-per-maand-gent-${year}.geojson" "https://data.stad.gent/api/explore/v2.1/catalog/datasets/criminaliteitscijfers-per-wijk-per-maand-gent-${year}/exports/geojson"
done
