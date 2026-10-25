export function generateToken() {
  return `SRKR-${Math.floor(1000 + Math.random() * 9000)}`;
}
