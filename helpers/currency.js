export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
  }).format(amount);
};
