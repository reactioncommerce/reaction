export function riskBadgeStatus(riskLevel) {
  let label;
  switch (riskLevel) {
    case "high risk":
      label = "danger";
      break;
    case "elevated":
      label = "warning";
      break;
    default:
      label = "";
  }
  return label;
}
