import React from 'react';
import { StyleSheet, View, ActivityIndicator, ImageBackground } from 'react-native';
import { WebView } from 'react-native-webview';

const PrivacyPolicyScreen = () => {
  return (
    <ImageBackground 
      source={require('../../assets/images/bg.png')} 
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.webviewContainer}>
        <WebView
          source={{ uri: 'https://sites.google.com/view/vneid-chinh-sach/home' }}
          style={styles.webview}
          startInLoadingState={true}
          renderLoading={() => (
            <ActivityIndicator
              color="#dc3545"
              size="large"
              style={styles.loading}
            />
          )}
          // Đảm bảo không nhảy ra trình duyệt ngoài
          onShouldStartLoadWithRequest={(request) => {
            return true;
          }}
          setSupportMultipleWindows={false}
        />
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webviewContainer: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)', // Thêm lớp phủ nhẹ để dễ đọc nội dung web trên nền app
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PrivacyPolicyScreen;

