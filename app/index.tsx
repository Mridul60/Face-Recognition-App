import { ImageBackground, StyleSheet } from "react-native";

export default function Index() {
  return (
    <ImageBackground
      source={require('../assets/images/index-bg.png')}
      style={styles.background}
    >

    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {

  }
});