import React from "react";
import {
  View,
  Image,
  StyleSheet,
  Text,
  Platform,
  ImageSourcePropType,
} from "react-native";
import { useTheme } from "react-native-paper";

interface Props {
  /**
   * Si tu veux remplacer l'image par une autre, passe-la via la prop `source`.
   * Par défaut on utilise l'asset local './assets/arc-4k.png'
   */
  source?: ImageSourcePropType;
  label?: string; // optionnel: texte en dessous si besoin
}

const ScreenArc: React.FC<Props> = ({
  source = require("../../../assets/images/screen.png"),
  label = "",
}) => {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.arcWrapper}>
        <Image source={source} style={styles.arcImage} resizeMode="contain" />
      </View>

      {label ? (
        <Text style={[styles.label, { color: theme.colors.onSurface || "#333" }]}>
          {label}
        </Text>
      ) : null}
    </View>
  );
};

export default ScreenArc;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    marginVertical: 10,
    // paddingHorizontal to avoid touching edges on small screens
    paddingHorizontal: 12,
  },

  arcWrapper: {
    width: "100%",
    alignItems: "center",
    // espace en haut pour que l'arc soit vu "depuis le haut"
    paddingTop: 6,
  },

  arcImage: {
    width: "90%",         // s'adapte à l'écran (change si besoin)
    height: 84,           // hauteur visible de l'arc; ajuste selon ton UI
    // ombre iOS
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
    // pour améliorer netteté sur bords
    tintColor: undefined,
  },

  label: {
    marginTop: 8,
    fontSize: 13,
    opacity: 0.8,
  },
});
