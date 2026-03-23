import { Text, View } from "react-native";
import { purchaseStyles } from "./purchaseStyles";

// Composant pour le stepper
export const PurchaseStepper = ({ step, theme }: { step: number; theme: any }) => (
  <View style={purchaseStyles.stepperContainer}>
    <View style={purchaseStyles.stepper}>
      <View style={[purchaseStyles.step, step >= 1 && purchaseStyles.stepActive]}>
        <Text style={[
          purchaseStyles.stepText, 
          step >= 1 && purchaseStyles.stepTextActive,
          { 
            backgroundColor: step >= 1 ? theme.colors.primary : theme.colors.surfaceVariant,
            color: step >= 1 ? '#fff' : theme.colors.onSurfaceVariant 
          }
        ]}>1</Text>
        <Text style={[
          purchaseStyles.stepLabel, 
          step >= 1 && purchaseStyles.stepLabelActive,
          { color: step >= 1 ? theme.colors.primary : theme.colors.onSurfaceVariant }
        ]}>Deplacement</Text>
      </View>
      <View style={[
        purchaseStyles.stepLine, 
        step >= 2 && purchaseStyles.stepLineActive,
        { 
          backgroundColor: step >= 2 ? theme.colors.primary : theme.colors.surfaceVariant 
        }
      ]} />

      {/* <View style={[purchaseStyles.step, step >= 2 && purchaseStyles.stepActive]}>
        <Text style={[
          purchaseStyles.stepText,
          {
            backgroundColor: step >= 2 ? theme.colors.primary : theme.colors.surfaceVariant,
            color: step >= 2 ? '#fff' : theme.colors.onSurfaceVariant
          }
        ]}>2</Text>
        <Text style={[
          purchaseStyles.stepLabel,
          { color: step >= 2 ? theme.colors.primary : theme.colors.onSurfaceVariant }
        ]}>Restauration</Text>
      </View>
      <View style={[
        purchaseStyles.stepLine,
        { backgroundColor: step >= 2 ? theme.colors.primary : theme.colors.surfaceVariant }
      ]} /> */}

      <View style={[purchaseStyles.step, step >= 2 && purchaseStyles.stepActive]}>
        <Text style={[
          purchaseStyles.stepText, 
          step >= 2 && purchaseStyles.stepTextActive,
          { 
            backgroundColor: step >= 3 ? theme.colors.primary : theme.colors.surfaceVariant,
            color: step >= 2 ? '#fff' : theme.colors.onSurfaceVariant 
          }
        ]}>3</Text>
        <Text style={[
          purchaseStyles.stepLabel, 
          step >= 2 && purchaseStyles.stepLabelActive,
          { color: step >= 3 ? theme.colors.primary : theme.colors.onSurfaceVariant }
        ]}>Confirmation</Text>
      </View>
    </View>
  </View>
);