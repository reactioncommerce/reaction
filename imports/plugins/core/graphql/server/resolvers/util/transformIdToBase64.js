export default function transformIdToBase64(namespace, id) {
  const unencoded = `${namespace}:${id}`;
  return Buffer.from(unencoded).toString("base64");
}
