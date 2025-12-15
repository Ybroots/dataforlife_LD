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
// @ts-ignore – cho phép import file JSON lớn
import mapData from "../../map.json";

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

  searchInput: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 10,
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
  coordinates: LatLng[];
  properties?: { [key: string]: any };
};

const rawFeatures = (mapData as any).features as GeoJSONFeature[];

const COMMUNE_POLYGONS: CommunePolygon[] = rawFeatures.map(
  (feature, index) => {
    const { geometry, properties } = feature;

    // Lấy vòng polygon chính (ring đầu tiên)
    const rawCoords =
      geometry.type === "Polygon"
        ? (geometry.coordinates as number[][][])[0]
        : ((geometry.coordinates as number[][][][])[0] ?? [])[0];

    const coordinates: LatLng[] =
      rawCoords?.map(([lng, lat]) => ({
        latitude: lat,
        longitude: lng,
      })) ?? [];

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
  }
).filter((c) => c.coordinates.length > 0);

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
  ).slice(0, 20); // LIMIT 20

  const focusOnCommune = (commune: CommunePolygon) => {
    if (commune.coordinates.length === 0 || !mapRef.current) return;

    const lats = commune.coordinates.map((p) => p.latitude);
    const lngs = commune.coordinates.map((p) => p.longitude);

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
            <TextInput
              placeholder="Tìm kiếm xã/phường..."
              style={styles.searchInput}
              value={keyword}
              onChangeText={setKeyword}
            />

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

      {/* Bản đồ với polygon */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={{ flex: 1 }}
        initialRegion={initialRegion}
      >
        {COMMUNE_POLYGONS.map((commune) => (
          <Polygon
            key={commune.id}
            coordinates={commune.coordinates}
            tappable
            strokeWidth={2}
            strokeColor={
              selectedCommune?.id === commune.id ? "#ffffff" : "#FF5722"
            }
            fillColor={
              selectedCommune?.id === commune.id
                ? "rgba(255, 87, 34, 0.55)"
                : "rgba(255, 87, 34, 0.25)"
            }
            onPress={() => handleSelectCommune(commune)}
          />
        ))}
      </MapView>
    </View>
  );
};

export default MapScreen;