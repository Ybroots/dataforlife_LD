"""Read-only canonical dataset/API parity check; never prints contact details."""
import argparse
import json
from pathlib import Path
from playwright.sync_api import sync_playwright


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--base', required=True)
    parser.add_argument('--snapshot', required=True, type=Path)
    args = parser.parse_args()
    plan = json.loads(args.snapshot.read_text(encoding='utf-8'))
    checks = 0
    total_contacts = 0
    with sync_playwright() as pw:
        api = pw.request.new_context(base_url=args.base)
        assert api.get('/api/health').json()['dataSource'] == 'postgres'
        overview = api.get('/api/v1/areas/overview').json()['data']
        assert overview['type'] == 'FeatureCollection'
        assert len(overview['features']) == 124
        assert {f['id'] for f in overview['features']} == {l['code'] for l in plan['localities']}
        for feature in overview['features']:
            assert feature['geometry']['type'] in ['Polygon', 'MultiPolygon'] and feature['geometry']['coordinates']
            assert set(feature['properties']) == {'code', 'name', 'localityType', 'provinceName'}
        print('PASS province overview: all 124 unique boundaries, public metadata only', flush=True)
        for locality in plan['localities']:
            code = locality['code']
            response = api.get('/api/v1/lookup/by-code/' + code)
            assert response.ok, f'{code}: lookup unavailable'
            area = response.json()['data']
            for key in ['name', 'population', 'areaKm2', 'densityPerKm2']:
                assert area[key] == locality[key], f'{code}: {key} mismatch'
            assert area['boundary']['type'] in ['Polygon', 'MultiPolygon'] and area['boundary']['coordinates'], f'{code}: missing boundary'
            expected = sorted((e['displayName'], e['phone'], e['rank'] or '', e['roleTitle'] or '') for e in plan['directoryEntries'] if e['localityCode'] == code and e['visibility'] == 'public')
            actual = sorted((e['displayName'], e['phone'], e['rank'] or '', e['roleTitle'] or '') for e in area['directory'])
            assert actual == expected, f'{code}: public directory mismatch ({len(actual)} vs {len(expected)})'
            total_contacts += len(actual)
            unit_codes = [u['code'] for u in plan['units'] if u['localityCode'] == code]
            stations = [s for s in plan['stations'] if s['unitCode'] in unit_codes and s['visibility'] == 'public']
            if stations:
                assert area['station'] and area['station']['address'] == stations[0]['address'], f'{code}: station mismatch'
            center = area['center']
            found = api.get(f"/api/v1/lookup/by-location?lat={center['latitude']}&lng={center['longitude']}").json()['data']
            assert found['code'] == code, f'{code}: wrong geographic lookup'
            search = api.get('/api/v1/areas', params={'query': code}).json()['data']
            assert any(x['code'] == code for x in search), f'{code}: not searchable'
            checks += 1
            if checks % 25 == 0:
                print(f'PASS {checks}/124 localities: metadata, boundary, directory, search and coordinates', flush=True)
        hotlines = api.get('/api/v1/hotlines').json()['data']
        units = api.get('/api/v1/directory/units').json()['data']
        assert sorted((e['displayName'],e['phone'],e['unitCode']) for e in units) == sorted((e['displayName'],e['phone'],e['unitCode']) for e in plan['directoryEntries'] if e['localityCode'] is None and e['visibility']=='public'), 'Unit directory mismatch'
        assert total_contacts + len(units) == 296, 'Incomplete source directory'
        assert sorted((h['categoryCode'],h['label'],h['phone']) for h in hotlines) == sorted((h['categoryCode'],h['label'],h['phone']) for h in plan['hotlines'] if h['visibility']=='public'), 'Hotline mismatch'
        assert api.get('/api/v1/lookup/by-code/DEMO-DA-LAT').status == 404, 'Demo locality still public'
        assert not any(x['code'].startswith('DEMO') for x in api.get('/api/v1/areas',params={'query':'DEMO'}).json()['data']), 'Demo locality in search'
        api.dispose()
    print(json.dumps({'localities':checks, 'boundaries':checks, 'directoryContacts':total_contacts + len(units), 'hotlines':len(hotlines), 'status':'PASS'}), flush=True)


if __name__ == '__main__':
    main()
