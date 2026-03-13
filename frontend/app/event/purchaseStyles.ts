import { StyleSheet } from "react-native";

export const purchaseStyles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    minHeight: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  backButton: {
    marginRight: 15,
    padding: 4,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    marginRight: 40,
    fontWeight: 'bold',
  },
  stepperContainer: {
    width: '100%',
    marginBottom: 30,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  step: {
    alignItems: 'center',
    paddingHorizontal: 1,
  },
  stepActive: {},
  stepText: {
    width: 32,
    height: 32,
    borderRadius: 16,
    textAlign: 'center',
    lineHeight: 32,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  stepTextActive: {},
  stepLabel: {
    fontSize: 10,
    fontWeight: '400',
  },
  stepLabelActive: {},
  stepLine: {
    width: 60,
    height: 2,
    marginHorizontal: 10,
  },
  stepLineActive: {},
  card: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  eventName: {
    flex: 1,
    fontWeight: 'bold',
    marginRight: 10,
  },
  tierBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  tierBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  eventDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailText: {
    marginLeft: 8,
  },
  divider: {
    marginVertical: 20,
  },
  stepContainer: {
    alignItems: 'center',
    width: '100%',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  tiersContainer: {
    gap: 12,
    marginBottom: 30,
    width: '100%',
  },
  tierCard: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    position: 'relative',
  },
  tierCardSelected: {
    borderWidth: 2,
  },
  tierCardDisabled: {
    opacity: 0.6,
  },
  tierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  soldOutBadge: {
    backgroundColor: '#ffebee',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  soldOutText: {
    color: '#c62828',
    fontSize: 10,
    fontWeight: 'bold',
  },
  tierPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  tierAvailability: {
    fontSize: 12,
  },
  selectedIndicator: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  nextButton: {
    borderRadius: 12,
    paddingVertical: 8,
    width: '100%',
    marginTop: 20,
  },
  nextButtonContent: {
    paddingVertical: 8,
  },
  quantityStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  stepperButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  stepperButtonDisabled: {
    opacity: 0.5,
  },
  quantityDisplay: {
    alignItems: 'center',
    marginHorizontal: 30,
    minWidth: 80,
  },
  quantityText: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  quantityLabel: {
    fontSize: 14,
    marginTop: 4,
  },
  quantityHint: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 30,
  },
  pricePreview: {
    padding: 20,
    borderRadius: 12,
    width: '100%',
    marginBottom: 30,
    marginTop: 16,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  priceValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  quantityActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  backButtonStep: {
    flex: 1,
    marginRight: 8,
  },
  confirmationHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  confirmationTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 12,
    textAlign: 'center',
  },
  orderDetails: {
    width: '100%',
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderLabel: {
    fontSize: 14,
  },
  orderValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  orderDivider: {
    marginVertical: 16,
  },
  totalRow: {
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  finalActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  confirmButton: {
    flex: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  confirmButtonContent: {
    paddingVertical: 6,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 20,
    gap: 12,
  },
  confirmationSection: {
    width: '100%',
    marginBottom: 20,
  },
  tierSummaryCard: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  tierSummaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  availabilityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  availabilityText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  tierDivider: {
    marginVertical: 12,
  },
  tierSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  tierSummaryLabel: {
    fontSize: 14,
  },
  tierSummaryValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});
