// import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList } from "react-native";
// import { useState } from "react";
// import { WebView } from "react-native-webview";
// import AntDesign from "@expo/vector-icons/AntDesign";

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#fff",
//   },

//   overlayContainer: {
//     position: "absolute",
//     width: "100%",
//     top: 10,
//     paddingHorizontal: 4,
//     zIndex: 999,
//   },

//   dropdownBox: {
//     backgroundColor: "#fff",
//     borderRadius: 10,
//     borderWidth: 1,
//     borderColor: "#d9d9d9",
//     padding: 12,
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     elevation: 4,
//   },

//   searchInput: {
//     backgroundColor: "#fff",
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 10,
//     paddingHorizontal: 12,
//     paddingVertical: 10,
//     marginTop: 10,
//   },

//   dropdownList: {
//     backgroundColor: "#fff",
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 10,
//     marginTop: 5,
//     maxHeight: 350,
//   },

//   item: {
//     padding: 14,
//     borderBottomWidth: 1,
//     borderColor: "#eee",
//   },

//   itemText: {
//     fontSize: 16,
//   },
// });

// const ALL_COMMUNES = [
//   "Hòa Thắng",
// ];

// const MapScreen = () => {
//   const myMapUrl =
//     "https://www.google.com/maps/d/u/0/viewer?mid=1ZB99i3agA0Wc0QqlquYLGWbEMfLGUZM&usp=sharing";

//   const [open, setOpen] = useState(false);
//   const [keyword, setKeyword] = useState("");
//   const [selected, setSelected] = useState("Chọn xã/phường");

//   const filteredList = ALL_COMMUNES.filter((x) =>
//     x.toLowerCase().includes(keyword.toLowerCase())
//   ).slice(0, 10); // LIMIT 10

//   // Chặn mở trang Google
//   const handleShouldStartLoadWithRequest = (request: any) => {
//     if (
//       request.url.includes("google.com/maps/d") &&
//       request.url.includes("1ZB99i3agA0Wc0QqlquYLGWbEMfLGUZM")
//     ) {
//       return true;
//     }
//     return false;
//   };

//   // CSS inject ẩn Google elements
//   const injectedJavaScript = ` ... giữ nguyên như code bạn gửi ... `;

//   return (
//     <View style={styles.container}>
//       {/* 🔍 Overlay Search */}
//       <View style={styles.overlayContainer}>
        
//         {/* Hộp chọn xã */}
//         <TouchableOpacity
//           style={styles.dropdownBox}
//           onPress={() => setOpen(!open)}
//           activeOpacity={1}
//         >
//           <Text style={{ fontSize: 16 }}>{selected}</Text>
//           <AntDesign name={open ? "up" : "down"} size={18} />
//         </TouchableOpacity>

//         {/* Ô tìm kiếm */}
//         {open && (
//           <>
//             <TextInput
//               placeholder="Tìm kiếm xã/phường..."
//               style={styles.searchInput}
//               value={keyword}
//               onChangeText={setKeyword}
//             />

//             {/* Danh sách */}
//             <View style={styles.dropdownList}>
//               <FlatList
//                 data={filteredList}
//                 keyExtractor={(item) => item}
//                 renderItem={({ item }) => (
//                   <TouchableOpacity
//                     style={styles.item}
//                     onPress={() => {
//                       setSelected(item);
//                       setOpen(false);
//                     }}
//                   >
//                     <Text style={styles.itemText}>{item}</Text>
//                   </TouchableOpacity>
//                 )}
//               />
//             </View>
//           </>
//         )}
//       </View>

//       {/* WebView map */}
//       <WebView
//         source={{ uri: myMapUrl }}
//         style={{ flex: 1 }}
//         injectedJavaScript={injectedJavaScript}
//         javaScriptEnabled={true}
//         onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
//         originWhitelist={["https://www.google.com"]}
//         allowsBackForwardNavigationGestures={false}
//       />
//     </View>
//   );
// };

// export default MapScreen;
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";

const MapScreen = () => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* <AntDesign name="earth" size={80} color="#dc3545" /> */}
        <Text style={styles.title}>Tính năng đang phát triển</Text>
        <Text style={styles.subtitle}>
          Chức năng bản đồ sẽ được cập nhật trong phiên bản tiếp theo
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
    paddingHorizontal: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginTop: 20,
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
  },
});

export default MapScreen;