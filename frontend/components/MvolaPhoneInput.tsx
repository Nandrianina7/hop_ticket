import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";

interface Props {
  onChange?: (value: string) => void;
}

const MvolaPhoneInput: React.FC<Props> = ({ onChange }) => {
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  const validatePhone = (value: string) => {
    // Normalize
    const cleaned = value.replace(/\s+/g, "");

    // MVola prefixes: 032, 033, 034, 038, 039
    const pattern = /^(?:\+261|0)(32|33|34|38)\d{6}$/;

    return pattern.test(cleaned);
  };

  const handleChange = (value: string) => {
    setPhone(value);

    if (validatePhone(value)) {
      setError("");
      onChange?.(value.replace(/\s+/g, ""));
    } else {
      setError("Numéro MVola invalide");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Numéro MVola</Text>

      <TextInput
        style={[styles.input, error ? styles.inputError : null]}
        placeholder="Ex: 0331234567"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={handleChange}
      />

      {error !== "" && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: "100%", marginBottom: 12 },
  label: { fontSize: 16, marginBottom: 4, color: "#333" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  inputError: { borderColor: "red" },
  error: { marginTop: 4, color: "red", fontSize: 14 },
});

export default MvolaPhoneInput;
