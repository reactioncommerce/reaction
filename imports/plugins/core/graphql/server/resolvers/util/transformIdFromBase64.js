export default function transformIdFromBase64(id) {
  const result = Buffer.from(id, "base64").toString("utf8");
  const values = result.split(":");
  return { namespace: values[0], id: values[1] };
}
