import MvolaPhoneInput from "@/components/MvolaPhoneInput";
import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert, StyleSheet } from "react-native";
// import MvolaPhoneInput from "./MvolaPhoneInput";

export default function MvolaPage() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!phoneNumber) {
      Alert.alert("Erreur", "Veuillez entrer un numéro MVola valide.");
      return;
    }

    console.log("Créditer le numéro MVola:", phoneNumber);
    setSubmitted(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Créditer MVola</Text>

        <MvolaPhoneInput onChange={(num) => setPhoneNumber(num)} />

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Soumettre</Text>
        </TouchableOpacity>

        {submitted && (
          <Text style={styles.success}>
            Numéro MVola soumis : {phoneNumber}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    padding: 16,
  },
  card: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    elevation: 5,
  },
  title: {
    textAlign: "center",
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 16,
  },
  button: {
    marginTop: 16,
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
  },
  success: {
    marginTop: 20,
    color: "green",
    textAlign: "center",
    fontSize: 16,
  },
});

// export default MvolaPage;
