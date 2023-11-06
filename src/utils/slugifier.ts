export default class Slugifier {
  static slugifyWithRandomString(text: string) {
    if (text === "") {
      return "";
    }
    const slug = text
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
      
    return slug;
  }

  static randomString(){
    return Math.random().toString(36).substring(2, 12)
  }
}
