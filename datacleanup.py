import json
import re
from os import listdir
from os.path import isfile, join
from typing import TextIO, Any


def is_geojson(filename: str) -> bool:
    return re.fullmatch(r"^(.*\.geojson)$", filename) is not None


def get_all_geojson_in_directory(path: str) -> list[str]:
    all_files = [f for f in listdir(path) if (isfile(join(path, f)) and is_geojson(f))]

    return all_files


def extract_year_from_filename(filename: str) -> str:
    return re.search(r"(\d{4})_dirty\.geojson$", filename).group(1)


def is_crime_data_per_year(filename: str) -> bool:
    return re.search(r"(\d{4})_dirty\.geojson$", filename) is not None


def is_residents_per_quarter_data(filename: str) -> bool:
    return filename == "residents_per_quarter_dirty.geojson"


def is_quarter_shapes_data(filename: str) -> bool:
    return filename == "quarter_shapes_dirty.geojson"


def cleanup_crime_data_per_year(features: Any):
    filtered_data = []
    for feature in features:
        properties = feature["properties"]
        # list of keys we want to delete (if they are present)
        to_delete = ["geo_point_2d", "quarter_code", "total_cum"]
        for key in to_delete:
            if key in properties:
                del properties[key]
        quarter = properties["quarter"]
        if quarter is not None:
            if quarter == "Stationsbuurt Noord":
                quarter = "Stationsbuurt-Noord"
            elif quarter == "Stationsbuurt Zuid":
                quarter = "Stationsbuurt-Zuid"
        properties["quarter"] = quarter
        # cleanup crime type
        if properties["fact_category"] == "Verkeerongevallen met lichamelijk letsel":
            properties["fact_category"] = "Verkeersongevallen met lichamelijk letsel"

        filtered_data.append(properties)
    year = extract_year_from_filename(filename)
    with open(f"{path}/data_{year}.json", "w") as output_file:
        json.dump(filtered_data, output_file)


def cleanup_residents_per_quarter_data(features: Any):
    filtered_data = []
    for feature in features:
        properties = feature["properties"]
        quarter = properties["wijk"]
        if quarter is not None:
            number_of_residents = properties["valuestring"]
            filtered_data.append({
                "quarter": quarter,
                "number_of_residents": number_of_residents
            })
    with open(f"{path}/residents_per_quarter.json", "w") as output_file:
        json.dump(filtered_data, output_file)


def extract_quarters_with_shapes(features: Any):
    filtered_data = []
    for feature in features:
        quarter = feature["properties"]["wijk"]
        geometry = feature["geometry"]
        filtered_data.append({
            "type": "Feature",
            "geometry": geometry,
            "properties": {"quarter": quarter}
        })
    with open(f"{path}/quarter_shapes.geojson", "w") as output_file:
        json.dump({
            "type": "FeatureCollection",
            "features": filtered_data
        }, output_file)


if __name__ == "__main__":
    path = "public/Datasets"
    all_geo_json = get_all_geojson_in_directory(path)
    for filename in all_geo_json:
        with open(f"{path}/{filename}") as input_file:
            data = json.load(input_file)
            features = data["features"]
            if is_crime_data_per_year(filename):
                cleanup_crime_data_per_year(features)
            if is_residents_per_quarter_data(filename):
                cleanup_residents_per_quarter_data(features)
            if is_quarter_shapes_data(filename):
                extract_quarters_with_shapes(features)
