// @ts-nocheck
import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
} from "react-native";
import MapView, {
  Polygon,
  PROVIDER_GOOGLE,
  Region,
} from "react-native-maps";
import AntDesign from "@expo/vector-icons/AntDesign";
// @ts-ignore – cho phép import file GeoJSON lớn
import mapData from "../../map34.json";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  overlayContainer: {
    position: "absolute",
    width: "100%",
    top: 10,
    paddingHorizontal: 4,
    zIndex: 999,
  },

  dropdownBox: {
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#d9d9d9",
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 4,
  },

  searchWrapper: {
    position: "relative",
    marginTop: 10,
  },

  clearButton: {
    position: 'absolute',
    right: 12,
    top: 16,
  },

  searchInput: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    height: 50,
  },

  dropdownList: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    marginTop: 5,
    maxHeight: 350,
  },

  item: {
    padding: 14,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },

  itemText: {
    fontSize: 16,
  },
});

type LatLng = { latitude: number; longitude: number };

type GeoJSONFeature = {
  geometry: {
    type: "Polygon" | "MultiPolygon";
    // GeoJSON dùng [lng, lat]
    coordinates: number[][][] | number[][][][];
  };
  properties?: {
    [key: string]: any;
  };
};

type CommunePolygon = {
  id: string;
  name: string;
  // Một xã có thể gồm nhiều polygon (MultiPolygon)
  coordinates: LatLng[][];
  properties?: { [key: string]: any };
};

const rawFeatures = (mapData as any).features as GeoJSONFeature[];

const COMMUNE_POLYGONS: CommunePolygon[] = rawFeatures
  .map((feature, index) => {
    const { geometry, properties } = feature;

    let coordinates: LatLng[][] = [];

    if (geometry.type === "Polygon") {
      const rings = geometry.coordinates as number[][][];
      const outerRing = rings[0] ?? [];
      coordinates = [
        outerRing.map(([lng, lat]) => ({
          latitude: lat,
          longitude: lng,
        })),
      ];
    } else if (geometry.type === "MultiPolygon") {
      const polys = geometry.coordinates as number[][][][];
      coordinates = polys.map((poly) => {
        const outerRing = poly[0] ?? [];
        return outerRing.map(([lng, lat]) => ({
          latitude: lat,
          longitude: lng,
        }));
      });
    }

    const name =
      (properties && (properties.ten_xa || properties.name)) ||
      `Xã ${index + 1}`;

    const id =
      (properties &&
        (properties.ma_xa || properties.id || properties.code))?.toString() ??
      String(index);

    return {
      id,
      name,
      coordinates,
      properties,
    };
  })
  .filter((c) => c.coordinates.length > 0);

const ALL_COMMUNES = COMMUNE_POLYGONS.map((c) => c.name);

const MapScreen = () => {
  const mapRef = useRef<MapView | null>(null);

  // Tính region khởi tạo từ polygon đầu tiên
  const firstPolygon = COMMUNE_POLYGONS[0];
  const firstPoint = firstPolygon?.coordinates[0];

  const initialRegion: Region = {
    latitude: firstPoint?.latitude ?? 11.6,
    longitude: firstPoint?.longitude ?? 107.7,
    latitudeDelta: 0.6,
    longitudeDelta: 0.6,
  };

  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [selected, setSelected] = useState("Chọn xã/phường");
  const [selectedCommune, setSelectedCommune] =
    useState<CommunePolygon | null>(null);

  const filteredList = COMMUNE_POLYGONS.filter((c) =>
    c.name.toLowerCase().includes(keyword.toLowerCase())
  );

  const focusOnCommune = (commune: CommunePolygon) => {
    if (commune.coordinates.length === 0 || !mapRef.current) return;

    const allPoints = commune.coordinates.flat();
    if (allPoints.length === 0) return;

    const lats = allPoints.map((p) => p.latitude);
    const lngs = allPoints.map((p) => p.longitude);

    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    const region: Region = {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: (maxLat - minLat) * 1.5 || 0.05,
      longitudeDelta: (maxLng - minLng) * 1.5 || 0.05,
    };

    mapRef.current.animateToRegion(region, 500);
  };

  const handleSelectCommune = (commune: CommunePolygon) => {
    setSelected(commune.name);
    setSelectedCommune(commune);
    setOpen(false);
    focusOnCommune(commune);
  };

  return (
    <View style={styles.container}>
      {/* 🔍 Overlay Search */}
      <View style={styles.overlayContainer}>
        
        {/* Hộp chọn xã */}
        <TouchableOpacity
          style={styles.dropdownBox}
          onPress={() => setOpen(!open)}
          activeOpacity={1}
        >
          <Text style={{ fontSize: 16 }}>{selected}</Text>
          <AntDesign name={open ? "up" : "down"} size={18} />
        </TouchableOpacity>

        {/* Ô tìm kiếm */}
        {open && (
          <>
            <View style={styles.searchWrapper}>
              <TextInput
                placeholder="Tìm kiếm xã/phường..."
                style={styles.searchInput}
                value={keyword}
                onChangeText={setKeyword}
              />
              {keyword.length > 0 && (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={() => setKeyword("")}
                >
                  <AntDesign name="close-circle" size={16} color="#999" />
                </TouchableOpacity>
              )}
            </View>

            {/* Danh sách */}
            <View style={styles.dropdownList}>
              <FlatList
                data={filteredList}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.item}
                    onPress={() => handleSelectCommune(item)}
                  >
                    <Text style={styles.itemText}>{item.name}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </>
        )}
      </View>

      {/* Bản đồ với polygon – chỉ hiển thị khi đã chọn xã để tránh lag */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={{ flex: 1 }}
        initialRegion={initialRegion}
      >
        {selectedCommune &&
          selectedCommune.coordinates.map((ring, idx) => (
            <Polygon
              key={`${selectedCommune.id}-${idx}`}
              coordinates={ring}
              tappable
              strokeWidth={2}
              strokeColor="#ffffff"
              fillColor="rgba(255, 87, 34, 0.55)"
              onPress={() => handleSelectCommune(selectedCommune)}
            />
          ))}
      </MapView>
    </View>
  );
};

export default MapScreen;