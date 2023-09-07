export default class Slugifier {
  static slugifyWithRandomString(text: string) {
    if (text === "") {
      return "";
    }
    const slug = text
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const randomString = Math.random().toString(36).substring(2, 12);
    const result = `${slug}-${randomString}`;
    return result;
  }
}
