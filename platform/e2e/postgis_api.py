import json
from urllib.error import HTTPError
from urllib.request import urlopen


BASE_URL = "http://127.0.0.1:3001"


def get(path: str) -> dict:
    with urlopen(f"{BASE_URL}{path}", timeout=10) as response:
        return json.load(response)


def main() -> None:
    assert get("/health") == {"status": "ok", "dataSource": "postgres"}

    areas = get("/v1/areas?query=Xuan")
    assert areas["data"][0]["code"] == "DEMO-DA-LAT"

    lookup = get("/v1/lookup/by-location?lat=11.944&lng=108.441")
    assert lookup["data"]["code"] == "DEMO-DA-LAT"
    assert lookup["data"]["station"]["address"] == "01 Đường Minh Họa, Lâm Đồng"
    assert len(lookup["data"]["directory"]) == 2
    assert lookup["data"]["boundary"]["type"] in {"Polygon", "MultiPolygon"}

    try:
        get("/v1/lookup/by-location?lat=10&lng=106")
    except HTTPError as error:
        assert error.code == 404
        assert json.load(error)["error"] == "LOCATION_OUTSIDE_COVERAGE"
    else:
        raise AssertionError("A point outside the fixture polygon must return 404")

    assert len(get("/v1/hotlines")["data"]) == 1


if __name__ == "__main__":
    main()
