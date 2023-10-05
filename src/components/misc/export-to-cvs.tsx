import Papa from "papaparse";

export default class ExportCSV {
  static handleDownload = (data: any, name: string) => {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);

    let linkElement = document.createElement("a");

    linkElement.setAttribute("href", url);
    linkElement.setAttribute("download", name + ".csv");

    linkElement.style.display = "none";

    document.body.appendChild(linkElement);

    linkElement.click();

    document.body.removeChild(linkElement);
  };
}
